import { and, eq } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { properties } from '@/src/db/schema';
import type { AuthUser } from '@/lib/auth/types';

export type PropertyVisibilityReason =
  | 'public approved property'
  | 'admin can view property'
  | 'owner can view property'
  | 'property is unpublished'
  | 'property moderation status is not approved';

export interface PropertyVisibilityDecision {
  isPublic: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canView: boolean;
  reason: PropertyVisibilityReason;
}

export function getPublicPropertyVisibilityCondition(): SQL {
  return and(eq(properties.isPublished, true), eq(properties.moderationStatus, 'approved')) as SQL;
}

export function isPublicPropertyVisible(property: {
  isPublished: boolean;
  moderationStatus: string | null | undefined;
}): boolean {
  return property.isPublished && property.moderationStatus?.toLowerCase() === 'approved';
}

export function canViewProperty(
  property: {
    isPublished: boolean;
    moderationStatus: string;
    createdByUserId: number;
  },
  user: AuthUser | null,
): boolean {
  return getPropertyVisibilityDecision(property, user).canView;
}

export function getPropertyVisibilityDecision(
  property: {
    isPublished: boolean;
    moderationStatus: string | null | undefined;
    createdByUserId: number;
  },
  user: AuthUser | null,
): PropertyVisibilityDecision {
  const isPublic = isPublicPropertyVisible(property);
  const isOwner = Boolean(user && user.id === property.createdByUserId);
  const isAdmin = user?.role === 'admin';

  if (isPublic) {
    return {
      isPublic,
      isOwner,
      isAdmin,
      canView: true,
      reason: 'public approved property',
    };
  }

  if (isAdmin) {
    return {
      isPublic,
      isOwner,
      isAdmin,
      canView: true,
      reason: 'admin can view property',
    };
  }

  if (isOwner) {
    return {
      isPublic,
      isOwner,
      isAdmin,
      canView: true,
      reason: 'owner can view property',
    };
  }

  return {
    isPublic,
    isOwner,
    isAdmin,
    canView: false,
    reason: property.isPublished
      ? 'property moderation status is not approved'
      : 'property is unpublished',
  };
}
