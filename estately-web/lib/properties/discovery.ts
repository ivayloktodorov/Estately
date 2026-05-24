import { and, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { favorites, properties } from '@/src/db/schema';

export type PublicProperty = typeof properties.$inferSelect;

const publicPropertyConditions = and(
  eq(properties.isPublished, true),
  eq(properties.moderationStatus, 'approved'),
);

export function formatPropertyCard(property: PublicProperty) {
  return {
    id: property.id,
    imageUrl: property.imageCoverUrl,
    price: `$${Number(property.price).toLocaleString()}`,
    title: property.title,
    city: property.city,
    address: property.address,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    propertyType: property.propertyType,
    listingType: (property.listingType === 'rent' ? 'rent' : 'sale') as 'sale' | 'rent',
    createdAt: property.createdAt,
    views: property.views,
    isFeatured: property.isFeatured,
  };
}

export async function getNewestProperties(limit = 8): Promise<PublicProperty[]> {
  return db
    .select()
    .from(properties)
    .where(publicPropertyConditions)
    .orderBy(desc(properties.createdAt), desc(properties.id))
    .limit(limit);
}

export async function getTrendingProperties(limit = 8): Promise<PublicProperty[]> {
  const rows = await db
    .select({
      property: properties,
      favoritesCount: count(favorites.id),
    })
    .from(properties)
    .leftJoin(favorites, eq(favorites.propertyId, properties.id))
    .where(publicPropertyConditions)
    .groupBy(properties.id)
    .orderBy(desc(count(favorites.id)), desc(properties.views), sql`random()`)
    .limit(limit);

  return rows.map((row) => row.property);
}

export async function getSitemapProperties(): Promise<Pick<PublicProperty, 'id' | 'updatedAt'>[]> {
  return db
    .select({
      id: properties.id,
      updatedAt: properties.updatedAt,
    })
    .from(properties)
    .where(publicPropertyConditions)
    .orderBy(desc(properties.updatedAt), desc(properties.id));
}
