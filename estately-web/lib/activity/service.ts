import { and, count, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { userActivity, type UserActivityType } from '@/src/db/schema';

export type { UserActivityType };

export type ActivityFilter = 'all' | 'properties' | 'messages' | 'inquiries' | 'profile';
export type ActivitySearchParams = Record<string, string | string[] | undefined>;

export interface ActivityListItem {
  id: number;
  type: UserActivityType;
  title: string;
  description: string;
  entityType: string | null;
  entityId: number | null;
  href: string | null;
  createdAt: Date;
}

export interface CreateActivityInput {
  userId: number;
  type: UserActivityType;
  title: string;
  description: string;
  entityType?: string;
  entityId?: number;
}

export interface UserActivityResult {
  activities: ActivityListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  filter: ActivityFilter;
}

const DEFAULT_PAGE_SIZE = 20;
const RECENT_LIMIT = 5;
const MIN_PAGE = 1;
const ACTIVITY_FILTERS = ['all', 'properties', 'messages', 'inquiries', 'profile'] as const;

function activityType(type: string): UserActivityType {
  switch (type) {
    case 'property_created':
    case 'property_updated':
    case 'property_approved':
    case 'property_rejected':
    case 'property_deleted':
    case 'inquiry_received':
    case 'message_received':
    case 'favorite_added':
    case 'profile_updated':
      return type;
    default:
      return 'profile_updated';
  }
}

function activityHref(entityType: string | null, entityId: number | null): string | null {
  if (!entityType || !entityId) {
    return null;
  }

  if (entityType === 'property') {
    return `/property/${entityId}`;
  }

  if (entityType === 'conversation') {
    return `/dashboard/messages/${entityId}`;
  }

  return null;
}

function toListItem(row: typeof userActivity.$inferSelect): ActivityListItem {
  return {
    id: row.id,
    type: activityType(row.type),
    title: row.title,
    description: row.description,
    entityType: row.entityType,
    entityId: row.entityId,
    href: activityHref(row.entityType, row.entityId),
    createdAt: row.createdAt,
  };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function activityFilter(value: string): ActivityFilter {
  return ACTIVITY_FILTERS.includes(value as ActivityFilter) ? (value as ActivityFilter) : 'all';
}

function typesForFilter(filter: ActivityFilter): UserActivityType[] {
  switch (filter) {
    case 'properties':
      return ['property_created', 'property_updated', 'property_approved', 'property_rejected', 'property_deleted'];
    case 'messages':
      return ['message_received'];
    case 'inquiries':
      return ['inquiry_received'];
    case 'profile':
      return ['favorite_added', 'profile_updated'];
    case 'all':
    default:
      return [];
  }
}

function parseSearchParams(searchParams: ActivitySearchParams) {
  const pageValue = Number(firstParam(searchParams.page));

  return {
    page: Number.isInteger(pageValue) && pageValue >= MIN_PAGE ? pageValue : MIN_PAGE,
    filter: activityFilter(firstParam(searchParams.filter)),
  };
}

function conditionsForUser(userId: number, filter: ActivityFilter): SQL[] {
  const conditions: SQL[] = [eq(userActivity.userId, userId)];
  const types = typesForFilter(filter);

  if (types.length > 0) {
    conditions.push(inArray(userActivity.type, types));
  }

  return conditions;
}

export async function createActivity(input: CreateActivityInput): Promise<void> {
  await db.insert(userActivity).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    description: input.description,
    entityType: input.entityType,
    entityId: input.entityId,
  });
}

export async function getUserActivity(
  userId: number,
  searchParams: ActivitySearchParams = {},
): Promise<UserActivityResult> {
  const parsed = parseSearchParams(searchParams);
  const whereClause = and(...conditionsForUser(userId, parsed.filter));
  const totalRows = await db.select({ value: count() }).from(userActivity).where(whereClause);
  const totalCount = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(parsed.page, totalPages);
  const offset = (currentPage - 1) * DEFAULT_PAGE_SIZE;

  const rows =
    totalCount > 0
      ? await db
          .select()
          .from(userActivity)
          .where(whereClause)
          .orderBy(desc(userActivity.createdAt), desc(userActivity.id))
          .limit(DEFAULT_PAGE_SIZE)
          .offset(offset)
      : [];

  return {
    activities: rows.map(toListItem),
    totalCount,
    currentPage,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    filter: parsed.filter,
  };
}

export async function getRecentUserActivity(userId: number): Promise<ActivityListItem[]> {
  const rows = await db
    .select()
    .from(userActivity)
    .where(eq(userActivity.userId, userId))
    .orderBy(desc(userActivity.createdAt), desc(userActivity.id))
    .limit(RECENT_LIMIT);

  return rows.map(toListItem);
}
