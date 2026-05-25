import { and, eq } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { properties } from '@/src/db/schema';
import type { AuthUser } from '@/lib/auth/types';

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
  return isPublicPropertyVisible(property) || user?.role === 'admin' || user?.id === property.createdByUserId;
}
