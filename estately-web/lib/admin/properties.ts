import { desc, eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, users } from '@/src/db/schema';

export interface AdminProperty {
  id: number;
  title: string;
  city: string;
  price: string;
  propertyType: string;
  listingType: string;
  isPublished: boolean;
  createdAt: Date;
  owner: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}

export async function getAdminProperties(): Promise<AdminProperty[]> {
  const rows = await db
    .select({
      id: properties.id,
      title: properties.title,
      city: properties.city,
      price: properties.price,
      propertyType: properties.propertyType,
      listingType: properties.listingType,
      isPublished: properties.isPublished,
      createdAt: properties.createdAt,
      ownerId: users.id,
      ownerFullName: users.fullName,
      ownerEmail: users.email,
    })
    .from(properties)
    .leftJoin(users, eq(properties.createdByUserId, users.id))
    .orderBy(desc(properties.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    city: row.city,
    price: row.price,
    propertyType: row.propertyType,
    listingType: row.listingType,
    isPublished: row.isPublished,
    createdAt: row.createdAt,
    owner:
      row.ownerId === null || row.ownerFullName === null || row.ownerEmail === null
        ? null
        : {
            id: row.ownerId,
            fullName: row.ownerFullName,
            email: row.ownerEmail,
          },
  }));
}
