import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { getPropertyVisibilityDecision } from '@/lib/properties/visibility';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';

interface DebugPropertyRouteProps {
  params: Promise<{
    id: string;
  }>;
}

function parsePropertyId(id: string): number | null {
  const propertyId = Number(id);

  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

function propertyNotFoundReason(input: {
  parsedId: number | null;
  foundByIdOnly: boolean;
  canView: boolean;
}): string | null {
  if (!input.parsedId) {
    return 'invalid id';
  }

  if (!input.foundByIdOnly) {
    return 'property row does not exist';
  }

  if (!input.canView) {
    return 'visibility check failed';
  }

  return null;
}

export async function GET(_request: Request, { params }: DebugPropertyRouteProps) {
  const { id } = await params;
  const parsedId = parsePropertyId(id);
  const currentUser = await getCurrentUser();

  if (!parsedId) {
    return NextResponse.json({
      success: true,
      id,
      parsedId,
      foundByIdOnly: false,
      property: null,
      currentUser: {
        id: currentUser?.id ?? null,
        role: currentUser?.role ?? 'guest',
      },
      visibility: {
        isPublic: false,
        isOwner: false,
        isAdmin: currentUser?.role === 'admin',
        canView: false,
        reason: 'invalid id',
      },
      wouldNotFound: true,
      notFoundReason: 'invalid id',
    });
  }

  const property = await db
    .select({
      id: properties.id,
      title: properties.title,
      isPublished: properties.isPublished,
      moderationStatus: properties.moderationStatus,
      createdByUserId: properties.createdByUserId,
      listingType: properties.listingType,
    })
    .from(properties)
    .where(eq(properties.id, parsedId))
    .then((results) => results[0] ?? null);

  const visibility = property
    ? getPropertyVisibilityDecision(property, currentUser)
    : {
        isPublic: false,
        isOwner: false,
        isAdmin: currentUser?.role === 'admin',
        canView: false,
        reason: 'property row does not exist',
      };
  const notFoundReason = propertyNotFoundReason({
    parsedId,
    foundByIdOnly: Boolean(property),
    canView: visibility.canView,
  });

  return NextResponse.json({
    success: true,
    id,
    parsedId,
    foundByIdOnly: Boolean(property),
    property,
    currentUser: {
      id: currentUser?.id ?? null,
      role: currentUser?.role ?? 'guest',
    },
    visibility,
    wouldNotFound: Boolean(notFoundReason),
    notFoundReason,
  });
}
