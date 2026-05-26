import { and, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/src/db/client';
import { favorites } from '@/src/db/schema';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileOptions, mobileSuccess } from '@/lib/mobile-api/responses';
import { mobilePropertyIdSchema, validationErrorMessage } from '@/lib/mobile-api/validation';

interface MobileFavoriteRouteProps {
  params: Promise<{
    propertyId: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: MobileFavoriteRouteProps) {
  const user = await getMobileAuthUser(request);

  if (!user) {
    return mobileError('Authentication required.', 401, request);
  }

  try {
    const { propertyId: propertyIdParam } = await params;
    const propertyId = mobilePropertyIdSchema.parse(propertyIdParam);

    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.propertyId, propertyId)));

    return mobileSuccess({ propertyId, isFavorited: false }, 200, request);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400, request);
  }
}

export const OPTIONS = mobileOptions;
