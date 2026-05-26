import { and, desc, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/src/db/client';
import { favorites, properties } from '@/src/db/schema';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileOptions, mobileSuccess } from '@/lib/mobile-api/responses';
import { mobileFavoriteSchema, validationErrorMessage } from '@/lib/mobile-api/validation';

export async function GET(request: NextRequest) {
  const user = await getMobileAuthUser(request);

  if (!user) {
    return mobileError('Authentication required.', 401, request);
  }

  const savedProperties = await db
    .select({
      id: properties.id,
      title: properties.title,
      description: properties.description,
      price: properties.price,
      city: properties.city,
      address: properties.address,
      propertyType: properties.propertyType,
      listingType: properties.listingType,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      areaSqm: properties.areaSqm,
      latitude: properties.latitude,
      longitude: properties.longitude,
      imageCoverUrl: properties.imageCoverUrl,
      isPublished: properties.isPublished,
      createdByUserId: properties.createdByUserId,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
      favoritedAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .where(and(eq(favorites.userId, user.id), eq(properties.moderationStatus, 'approved'), eq(properties.isPublished, true)))
    .orderBy(desc(favorites.createdAt));

  return mobileSuccess({ properties: savedProperties }, 200, request);
}

export async function POST(request: NextRequest) {
  const user = await getMobileAuthUser(request);

  if (!user) {
    return mobileError('Authentication required.', 401, request);
  }

  try {
    const { propertyId } = mobileFavoriteSchema.parse(await request.json());
    const property = await db
      .select({ id: properties.id })
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.moderationStatus, 'approved'), eq(properties.isPublished, true)))
      .then((rows) => rows[0]);

    if (!property) {
      return mobileError('Property not found.', 404, request);
    }

    await db
      .insert(favorites)
      .values({ userId: user.id, propertyId })
      .onConflictDoNothing({
        target: [favorites.userId, favorites.propertyId],
      });

    return mobileSuccess({ propertyId, isFavorited: true }, 201, request);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400, request);
  }
}

export const OPTIONS = mobileOptions;
