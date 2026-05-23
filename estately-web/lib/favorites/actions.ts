'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/src/db/client';
import { favorites, properties } from '@/src/db/schema';
import { requireAuth } from '@/lib/auth';

interface ToggleFavoriteResult {
  status: 'success' | 'error';
  isFavorited: boolean;
  message?: string;
}

export async function getFavoritePropertyIds(
  userId: number,
  propertyIds: number[],
): Promise<Set<number>> {
  if (propertyIds.length === 0) {
    return new Set();
  }

  const rows = await db
    .select({ propertyId: favorites.propertyId })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), inArray(favorites.propertyId, propertyIds)));

  return new Set(rows.map((row) => row.propertyId));
}

export async function toggleFavoriteAction(
  propertyId: number,
  shouldFavorite: boolean,
): Promise<ToggleFavoriteResult> {
  const user = await requireAuth();

  try {
    if (shouldFavorite) {
      const property = await db
        .select({ id: properties.id })
        .from(properties)
        .where(and(eq(properties.id, propertyId), eq(properties.isPublished, true)))
        .then((rows) => rows[0]);

      if (!property) {
        return {
          status: 'error',
          isFavorited: false,
          message: 'This property is no longer available.',
        };
      }

      await db
        .insert(favorites)
        .values({
          userId: user.id,
          propertyId,
        })
        .onConflictDoNothing({
          target: [favorites.userId, favorites.propertyId],
        });
    } else {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, user.id), eq(favorites.propertyId, propertyId)));
    }

    revalidatePath('/properties');
    revalidatePath('/favorites');
    revalidatePath(`/properties/${propertyId}`);

    return {
      status: 'success',
      isFavorited: shouldFavorite,
    };
  } catch (error) {
    console.error('Favorite toggle error:', error);
    return {
      status: 'error',
      isFavorited: !shouldFavorite,
      message: 'Unable to update favorites. Please try again.',
    };
  }
}
