import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';

export type DashboardProperty = Pick<
  typeof properties.$inferSelect,
  | 'id'
  | 'title'
  | 'description'
  | 'city'
  | 'address'
  | 'price'
  | 'propertyType'
  | 'listingType'
  | 'bedrooms'
  | 'bathrooms'
  | 'areaSqm'
  | 'isPublished'
  | 'moderationStatus'
  | 'moderationNotes'
  | 'createdAt'
>;

export async function getUserProperties(userId: number): Promise<DashboardProperty[]> {
  return db
    .select({
      id: properties.id,
      title: properties.title,
      description: properties.description,
      city: properties.city,
      address: properties.address,
      price: properties.price,
      propertyType: properties.propertyType,
      listingType: properties.listingType,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      areaSqm: properties.areaSqm,
      isPublished: properties.isPublished,
      moderationStatus: properties.moderationStatus,
      moderationNotes: properties.moderationNotes,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .where(eq(properties.createdByUserId, userId))
    .orderBy(desc(properties.createdAt));
}

export async function getUserPropertyById(
  propertyId: number,
  userId: number,
  options: { includeAllForAdmin?: boolean } = {},
): Promise<DashboardProperty | null> {
  const whereClause = options.includeAllForAdmin
    ? eq(properties.id, propertyId)
    : and(eq(properties.id, propertyId), eq(properties.createdByUserId, userId));

  const result = await db
    .select({
      id: properties.id,
      title: properties.title,
      description: properties.description,
      city: properties.city,
      address: properties.address,
      price: properties.price,
      propertyType: properties.propertyType,
      listingType: properties.listingType,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      areaSqm: properties.areaSqm,
      isPublished: properties.isPublished,
      moderationStatus: properties.moderationStatus,
      moderationNotes: properties.moderationNotes,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .where(whereClause)
    .limit(1);

  return result[0] ?? null;
}
