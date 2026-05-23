'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireAdmin, type UserRole } from '@/lib/auth';
import { canChangeUserRole } from '@/lib/admin/users';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';

function parseUserId(formData: FormData): number {
  const userId = Number(formData.get('userId'));

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid user ID.');
  }

  return userId;
}

function parseRole(formData: FormData): UserRole {
  const role = formData.get('role');

  if (role !== 'user' && role !== 'admin') {
    throw new Error('Invalid user role.');
  }

  return role;
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = parseUserId(formData);
  const role = parseRole(formData);
  const permission = await canChangeUserRole(admin.id, userId, role);

  if (!permission.allowed) {
    throw new Error(permission.message);
  }

  await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
}
