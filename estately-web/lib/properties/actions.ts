'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { db } from '@/src/db/client';
import { propertyImages, properties } from '@/src/db/schema';
import { requireAuth } from '@/lib/auth';
import { notifyAdminsOfPendingListing } from '@/lib/notifications/service';
import { createActivity } from '@/lib/activity/service';
import { uploadPropertyImage, validatePropertyImageFile } from '@/services/storage/property-images';
import { createPropertySchema } from './validation';
import type { PropertyActionState } from './types';

const genericError = 'Something went wrong. Please try again.';
const defaultCoverImageUrl =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop';
const maxPropertyImages = 10;

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function validationErrorState(error: ZodError, fields: Record<string, string>): PropertyActionState {
  const errors: PropertyActionState['errors'] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === 'string') {
      errors[field] = issue.message;
    }
  }

  return {
    status: 'error',
    message: 'Please fix the highlighted fields.',
    fields,
    errors,
  };
}

function imageFilesFromForm(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, maxPropertyImages);
}

export async function createPropertyAction(
  _prevState: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const user = await requireAuth();

  const fields = {
    title: formValue(formData, 'title'),
    description: formValue(formData, 'description'),
    price: formValue(formData, 'price'),
    city: formValue(formData, 'city'),
    address: formValue(formData, 'address'),
    propertyType: formValue(formData, 'propertyType'),
    listingType: formValue(formData, 'listingType'),
    bedrooms: formValue(formData, 'bedrooms'),
    bathrooms: formValue(formData, 'bathrooms'),
    areaSqm: formValue(formData, 'areaSqm'),
  };

  const parsed = createPropertySchema.safeParse(fields);
  const imageFiles = imageFilesFromForm(formData);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  if (formData.getAll('images').filter((value) => value instanceof File && value.size > 0).length > maxPropertyImages) {
    return {
      status: 'error',
      message: `Please upload ${maxPropertyImages} images or fewer.`,
      fields,
      errors: { images: `Please upload ${maxPropertyImages} images or fewer.` },
    };
  }

  for (const file of imageFiles) {
    const imageError = validatePropertyImageFile(file);

    if (imageError) {
      return {
        status: 'error',
        message: imageError,
        fields,
        errors: { images: imageError },
      };
    }
  }

  let propertyId: number | undefined;

  try {
    const validatedData = parsed.data;

    const result = await db
      .insert(properties)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price.toString(),
        city: validatedData.city,
        address: validatedData.address,
        propertyType: validatedData.propertyType,
        listingType: validatedData.listingType,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        areaSqm: validatedData.areaSqm,
        imageCoverUrl: defaultCoverImageUrl,
        createdByUserId: user.id,
        isPublished: false,
        moderationStatus: 'pending',
        moderationNotes: null,
        updatedAt: new Date(),
      })
      .returning({ id: properties.id, title: properties.title });

    propertyId = result[0]?.id;
    if (result[0]) {
      await createActivity({
        userId: user.id,
        type: 'property_created',
        title: 'Property created',
        description: `You created "${result[0].title}".`,
        entityType: 'property',
        entityId: result[0].id,
      });
    }

    if (result[0] && user.role !== 'admin') {
      await notifyAdminsOfPendingListing(result[0].id, result[0].title);
    }

    if (propertyId && imageFiles.length > 0) {
      for (const [index, file] of imageFiles.entries()) {
        const { imageUrl } = await uploadPropertyImage(file, propertyId);

        await db.insert(propertyImages).values({
          propertyId,
          imageUrl,
          sortOrder: index,
          isCover: index === 0,
        });

        if (index === 0) {
          await db
            .update(properties)
            .set({ imageCoverUrl: imageUrl, updatedAt: new Date() })
            .where(eq(properties.id, propertyId));
        }
      }
    }
  } catch (error) {
    console.error('Property creation error:', error);
    return {
      status: 'error',
      message: 'Unable to create this property right now. Please try again.',
      fields,
    };
  }

  if (!propertyId) {
    return { status: 'error', message: genericError, fields };
  }

  redirect(`/properties/${propertyId}`);
}
