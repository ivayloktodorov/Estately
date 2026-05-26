import { desc, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';

export async function GET(request: NextRequest) {
  const user = await getMobileAuthUser(request);

  if (!user) return mobileError('Authentication required.', 401);

  try {
    const rows = await db
      .select({
        id: properties.id,
        title: properties.title,
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
        moderationStatus: properties.moderationStatus,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
      })
      .from(properties)
      .where(eq(properties.createdByUserId, user.id))
      .orderBy(desc(properties.createdAt), desc(properties.id))
      .limit(100);

    return mobileSuccess(rows);
  } catch {
    return mobileError('Unable to load your properties right now.', 500);
  }
}
