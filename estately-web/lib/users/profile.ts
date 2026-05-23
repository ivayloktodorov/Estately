import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import type { UserRole } from '@/lib/auth';

export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileInput {
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  bio?: string;
  avatarUrl?: string | null;
}

export interface PasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function roleValue(role: string): UserRole {
  return role === 'admin' ? 'admin' : 'user';
}

function statusValue(status: string): UserStatus {
  return status === 'inactive' ? 'inactive' : 'active';
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName: firstName || fullName,
    lastName: rest.join(' '),
  };
}

export function toUserProfile(user: typeof users.$inferSelect): UserProfile {
  const fallbackName = splitFullName(user.fullName);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    firstName: user.firstName ?? fallbackName.firstName,
    lastName: user.lastName ?? fallbackName.lastName,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: roleValue(user.role),
    status: statusValue(user.status),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function cleanProfileInput(input: ProfileInput): ProfileInput {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const displayName = input.displayName?.trim() ?? '';
  const email = input.email.trim().toLowerCase();
  const bio = input.bio?.trim() ?? '';

  if (!firstName) {
    throw new Error('First name is required.');
  }

  if (!lastName) {
    throw new Error('Last name is required.');
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new Error('Enter a valid email address.');
  }

  return {
    firstName,
    lastName,
    displayName,
    email,
    bio,
    avatarUrl: input.avatarUrl,
  };
}

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user ? toUserProfile(user) : null;
}

export async function assertEmailAvailable(email: string, userId: number): Promise<void> {
  const existingUser = await db.query.users.findFirst({
    where: and(eq(users.email, email), ne(users.id, userId)),
  });

  if (existingUser) {
    throw new Error('Another account already uses this email address.');
  }
}

export async function updateUserProfile(userId: number, input: ProfileInput): Promise<void> {
  const cleanInput = cleanProfileInput(input);
  await assertEmailAvailable(cleanInput.email, userId);

  const fullName = `${cleanInput.firstName} ${cleanInput.lastName}`.trim();

  await db
    .update(users)
    .set({
      firstName: cleanInput.firstName,
      lastName: cleanInput.lastName,
      displayName: cleanInput.displayName || null,
      fullName,
      email: cleanInput.email,
      bio: cleanInput.bio || null,
      avatarUrl: cleanInput.avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function changeUserPassword(userId: number, input: PasswordInput): Promise<void> {
  if (!input.currentPassword) {
    throw new Error('Current password is required.');
  }

  if (input.newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters.');
  }

  if (input.newPassword !== input.confirmPassword) {
    throw new Error('New password and confirmation do not match.');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new Error('Current password is incorrect.');
  }

  await db
    .update(users)
    .set({
      passwordHash: await hashPassword(input.newPassword),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
