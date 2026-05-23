import { and, asc, count, desc, eq, ilike, ne, or, type SQL } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { favorites, properties, propertyMessages, users } from '@/src/db/schema';
import type { UserRole } from '@/lib/auth';
import { updateUserProfile, type UserStatus } from '@/lib/users/profile';
import { hashPassword } from '@/lib/auth/password';

export interface AdminUserListItem {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  bio: string | null;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
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
  sort: AdminUsersSort;
}

export interface AdminUserDetails extends AdminUserListItem {
  propertiesCount: number;
  favoritesCount: number;
  inquiriesCount: number;
}

export type AdminUsersSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE = 1;
const ADMIN_USERS_SORTS = ['newest', 'oldest', 'name', 'email', 'role'] as const;
export type AdminUsersSort = (typeof ADMIN_USERS_SORTS)[number];

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export function parseAdminUsersSearchParams(searchParams: AdminUsersSearchParams) {
  const pageValue = Number(firstParam(searchParams.page));
  const page = Number.isInteger(pageValue) && pageValue >= MIN_PAGE ? pageValue : MIN_PAGE;
  const sortParam = firstParam(searchParams.sort);
  const sort = ADMIN_USERS_SORTS.includes(sortParam as AdminUsersSort)
    ? (sortParam as AdminUsersSort)
    : 'newest';

  return {
    page,
    search: firstParam(searchParams.search).trim(),
    sort,
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

function userStatus(status: string): UserStatus {
  return status === 'inactive' ? 'inactive' : 'active';
}

function sortOrder(sort: AdminUsersSort) {
  switch (sort) {
    case 'oldest':
      return [asc(users.createdAt), asc(users.id)];
    case 'name':
      return [asc(users.fullName), asc(users.id)];
    case 'email':
      return [asc(users.email), asc(users.id)];
    case 'role':
      return [asc(users.role), asc(users.fullName)];
    case 'newest':
    default:
      return [desc(users.createdAt), desc(users.id)];
  }
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
            firstName: users.firstName,
            lastName: users.lastName,
            displayName: users.displayName,
            bio: users.bio,
            email: users.email,
            role: users.role,
            avatarUrl: users.avatarUrl,
            status: users.status,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(whereClause)
          .orderBy(...sortOrder(parsedParams.sort))
          .limit(DEFAULT_PAGE_SIZE)
          .offset(offset)
      : [];

  return {
    users: pageUsers.map((user) => ({
      ...user,
      firstName: user.firstName ?? user.fullName.split(/\s+/)[0] ?? user.fullName,
      lastName: user.lastName ?? user.fullName.split(/\s+/).slice(1).join(' '),
      role: userRole(user.role),
      status: userStatus(user.status),
    })),
    search: parsedParams.search,
    sort: parsedParams.sort,
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
      firstName: users.firstName,
      lastName: users.lastName,
      displayName: users.displayName,
      bio: users.bio,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
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
    firstName: user.firstName ?? user.fullName.split(/\s+/)[0] ?? user.fullName,
    lastName: user.lastName ?? user.fullName.split(/\s+/).slice(1).join(' '),
    role: userRole(user.role),
    status: userStatus(user.status),
    propertiesCount: propertyRows[0]?.value ?? 0,
    favoritesCount: favoriteRows[0]?.value ?? 0,
    inquiriesCount: inquiryRows[0]?.value ?? 0,
  };
}

export async function updateAdminUserProfile(
  userId: number,
  input: {
    firstName: string;
    lastName: string;
    displayName?: string;
    email: string;
    bio?: string;
    avatarUrl?: string | null;
    role: UserRole;
    status: UserStatus;
  },
): Promise<void> {
  await updateUserProfile(userId, input);

  await db
    .update(users)
    .set({
      role: input.role,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function resetAdminUserPassword(userId: number, password: string): Promise<void> {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  await db
    .update(users)
    .set({
      passwordHash: await hashPassword(password),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function setAdminUserStatus(userId: number, status: UserStatus): Promise<void> {
  await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function deleteAdminUser(actingAdminId: number, targetUserId: number): Promise<void> {
  if (actingAdminId === targetUserId) {
    throw new Error('You cannot delete your own account.');
  }

  await db.delete(users).where(and(eq(users.id, targetUserId), ne(users.id, actingAdminId)));
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
