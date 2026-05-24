import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { favorites, properties } from '@/src/db/schema';

export async function getFavoriteProperties(userId: number) {
  return db
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
      imageCoverUrl: properties.imageCoverUrl,
      isPublished: properties.isPublished,
      createdByUserId: properties.createdByUserId,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
    })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .where(and(eq(favorites.userId, userId), eq(properties.moderationStatus, 'approved'), eq(properties.isPublished, true)))
    .orderBy(desc(favorites.createdAt));
}
