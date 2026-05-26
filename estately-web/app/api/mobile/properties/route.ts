import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { createActivity } from '@/lib/activity/service';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { getMobilePaginatedProperties } from '@/lib/mobile-api/properties';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { mobilePropertyFiltersSchema, validationErrorMessage } from '@/lib/mobile-api/validation';
import { notifyAdminsOfPendingListing } from '@/lib/notifications/service';
import { LISTING_TYPES, PROPERTY_TYPES } from '@/lib/properties/constants';
import { createPropertySchema } from '@/lib/properties/validation';
import { db } from '@/src/db/client';
import { properties, propertyImages } from '@/src/db/schema';
import {
  assertPropertyImageUploadsConfigured,
  uploadPropertyImage,
  validatePropertyImageFile,
} from '@/services/storage/property-images';

const defaultCoverImageUrl =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop';
const maxPropertyImages = 10;
const maxPropertyPrice = 99_999_999;
const DATA_URL_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/;

function searchParamsToRecord(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries(searchParams.entries());
}

function fileFromDataUrl(dataUrl: string, index: number): File | null {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) return null;

  const [, type, data] = match;
  const bytes = Uint8Array.from(Buffer.from(data, 'base64'));
  const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';

  return new File([bytes], `property-${index}.${extension}`, { type });
}

function imageDataUrl(value: unknown): string {
  if (typeof value !== 'object' || value === null || !('dataUrl' in value)) {
    return '';
  }

  const dataUrl = (value as { dataUrl?: unknown }).dataUrl;

  return typeof dataUrl === 'string' ? dataUrl : '';
}

export async function GET(request: NextRequest) {
  try {
    const filters = mobilePropertyFiltersSchema.parse(searchParamsToRecord(request.nextUrl.searchParams));
    const result = await getMobilePaginatedProperties(filters);

    return mobileSuccess(result);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400);
  }
}

export async function POST(request: NextRequest) {
  const user = await getMobileAuthUser(request);

  if (!user) return mobileError('Authentication required.', 401);

  try {
    const body = await request.json();
    const parsed = createPropertySchema.safeParse({
      title: String(body.title ?? ''),
      description: String(body.description ?? ''),
      price: String(body.price ?? ''),
      city: String(body.city ?? ''),
      address: String(body.address ?? ''),
      propertyType: String(body.propertyType ?? ''),
      listingType: String(body.listingType ?? ''),
      bedrooms: String(body.bedrooms ?? ''),
      bathrooms: String(body.bathrooms ?? ''),
      areaSqm: String(body.areaSqm ?? ''),
    });

    if (!parsed.success) return mobileError(parsed.error.issues[0]?.message ?? 'Please check the property details.', 400);
    if (parsed.data.price > maxPropertyPrice) {
      return mobileError('Price is too large. Please enter a realistic property price.', 400);
    }

    if (!PROPERTY_TYPES.includes(parsed.data.propertyType) || !LISTING_TYPES.includes(parsed.data.listingType)) {
      return mobileError('Please select valid property and listing types.', 400);
    }

    const images: unknown[] = Array.isArray(body.images) ? body.images.slice(0, maxPropertyImages) : [];
    const files = images
      .map((image, index) => fileFromDataUrl(imageDataUrl(image), index))
      .filter((file): file is File => Boolean(file));

    if (images.length > maxPropertyImages) return mobileError(`Please upload ${maxPropertyImages} images or fewer.`, 400);

    for (const file of files) {
      const validationError = validatePropertyImageFile(file);
      if (validationError) return mobileError(validationError, 400);
    }

    if (files.length > 0) {
      try {
        assertPropertyImageUploadsConfigured();
      } catch {
        return mobileError('Image upload is not configured in production.', 400);
      }
    }

    const [createdProperty] = await db
      .insert(properties)
      .values({
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price.toString(),
        city: parsed.data.city,
        address: parsed.data.address,
        propertyType: parsed.data.propertyType,
        listingType: parsed.data.listingType,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        areaSqm: parsed.data.areaSqm,
        imageCoverUrl: defaultCoverImageUrl,
        createdByUserId: user.id,
        isPublished: false,
        moderationStatus: 'pending',
        moderationNotes: null,
        updatedAt: new Date(),
      })
      .returning({ id: properties.id, title: properties.title });

    if (!createdProperty) return mobileError('Unable to create property right now. Please try again.', 400);

    await createActivity({
      userId: user.id,
      type: 'property_created',
      title: 'Property created',
      description: `You created "${createdProperty.title}" from mobile.`,
      entityType: 'property',
      entityId: createdProperty.id,
    });

    if (user.role !== 'admin') {
      await notifyAdminsOfPendingListing(createdProperty.id, createdProperty.title);
    }

    for (const [index, file] of files.entries()) {
      const { imageUrl } = await uploadPropertyImage(file, createdProperty.id);
      await db.insert(propertyImages).values({
        propertyId: createdProperty.id,
        imageUrl,
        sortOrder: index,
        isCover: index === 0,
      });

      if (index === 0) {
        await db.update(properties).set({ imageCoverUrl: imageUrl, updatedAt: new Date() }).where(eq(properties.id, createdProperty.id));
      }
    }

    return mobileSuccess({ id: createdProperty.id, title: createdProperty.title, status: 'pending' }, 201);
  } catch {
    return mobileError('Unable to create property right now. Please try again.', 400);
  }
}
