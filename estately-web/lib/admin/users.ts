import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { favorites, properties, propertyMessages, users } from '@/src/db/schema';
import type { UserRole } from '@/lib/auth';

export interface AdminUserListItem {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface AdminUsersPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminUsersResult extends AdminUsersPagination {
  users: AdminUserListItem[];
  search: string;
}

export interface AdminUserDetails extends AdminUserListItem {
  propertiesCount: number;
  favoritesCount: number;
  inquiriesCount: number;
}

export type AdminUsersSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE = 1;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export function parseAdminUsersSearchParams(searchParams: AdminUsersSearchParams) {
  const pageValue = Number(firstParam(searchParams.page));
  const page = Number.isInteger(pageValue) && pageValue >= MIN_PAGE ? pageValue : MIN_PAGE;

  return {
    page,
    search: firstParam(searchParams.search).trim(),
  };
}

function userSearchCondition(search: string): SQL | undefined {
  if (!search) {
    return undefined;
  }

  const searchPattern = `%${search}%`;
  return or(ilike(users.email, searchPattern), ilike(users.fullName, searchPattern));
}

function userRole(role: string): UserRole {
  return role === 'admin' ? 'admin' : 'user';
}

export async function getAdminUsers(
  searchParams: AdminUsersSearchParams,
): Promise<AdminUsersResult> {
  const parsedParams = parseAdminUsersSearchParams(searchParams);
  const whereClause = userSearchCondition(parsedParams.search);

  const totalRows = await db
    .select({ value: count() })
    .from(users)
    .where(whereClause);

  const totalCount = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(parsedParams.page, totalPages);
  const offset = (currentPage - 1) * DEFAULT_PAGE_SIZE;

  const pageUsers =
    totalCount > 0
      ? await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(whereClause)
          .orderBy(desc(users.createdAt), desc(users.id))
          .limit(DEFAULT_PAGE_SIZE)
          .offset(offset)
      : [];

  return {
    users: pageUsers.map((user) => ({
      ...user,
      role: userRole(user.role),
    })),
    search: parsedParams.search,
    currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}

export async function getAdminUserDetails(userId: number): Promise<AdminUserDetails | null> {
  const userRows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userRows[0];

  if (!user) {
    return null;
  }

  const [propertyRows, favoriteRows, inquiryRows] = await Promise.all([
    db.select({ value: count() }).from(properties).where(eq(properties.createdByUserId, userId)),
    db.select({ value: count() }).from(favorites).where(eq(favorites.userId, userId)),
    db.select({ value: count() }).from(propertyMessages).where(eq(propertyMessages.userId, userId)),
  ]);

  return {
    ...user,
    role: userRole(user.role),
    propertiesCount: propertyRows[0]?.value ?? 0,
    favoritesCount: favoriteRows[0]?.value ?? 0,
    inquiriesCount: inquiryRows[0]?.value ?? 0,
  };
}

export async function canChangeUserRole(
  actingAdminId: number,
  targetUserId: number,
  nextRole: UserRole,
): Promise<{ allowed: true } | { allowed: false; message: string }> {
  if (actingAdminId !== targetUserId || nextRole !== 'user') {
    return { allowed: true };
  }

  const adminRows = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, 'admin'), eq(users.id, actingAdminId)));

  const targetIsAdmin = (adminRows[0]?.value ?? 0) > 0;

  if (!targetIsAdmin) {
    return { allowed: true };
  }

  const totalAdminRows = await db.select({ value: count() }).from(users).where(eq(users.role, 'admin'));
  const totalAdmins = totalAdminRows[0]?.value ?? 0;

  if (totalAdmins <= 1) {
    return {
      allowed: false,
      message: 'You cannot remove your own admin role because you are the only admin.',
    };
  }

  return { allowed: true };
}
