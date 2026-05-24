'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { requireAdmin, type UserRole } from '@/lib/auth';
import {
  canChangeUserRole,
  deleteAdminUser,
  resetAdminUserPassword,
  setAdminUserStatus,
  updateAdminUserProfile,
} from '@/lib/admin/users';
import type { UserStatus } from '@/lib/users/profile';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';
import { uploadR2Image, validateR2ImageFile } from '@/services/storage/r2';

export interface AdminUserActionState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

function state(status: AdminUserActionState['status'], message: string): AdminUserActionState {
  return { status, message };
}

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

function parseStatus(formData: FormData): UserStatus {
  const status = formData.get('status');
  return status === 'inactive' ? 'inactive' : 'active';
}

function fileFromFormData(formData: FormData): File | null {
  const file = formData.get('avatar');
  return file instanceof File && file.size > 0 ? file : null;
}

function isR2ConfigurationError(error: Error): boolean {
  return error.message.includes('R2_') || error.message.includes('CLOUDFLARE_R2_');
}

function logAdminUserUpdateError(error: unknown, context: { adminId?: number; userId?: number }) {
  console.error('Admin user update failed', {
    adminId: context.adminId,
    userId: context.userId,
    message: error instanceof Error ? error.message : 'Unknown error',
  });
}

function updateErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unable to update user profile. Please try again.';
  }

  if (isR2ConfigurationError(error)) {
    return 'Avatar uploads are not configured. Please contact an administrator.';
  }

  if (
    error.message === 'Image must be 5MB or smaller.' ||
    error.message === 'Only JPG, JPEG, PNG, and WEBP images are allowed.' ||
    error.message === 'Please choose an image file to upload.' ||
    error.message === 'First name is required.' ||
    error.message === 'Last name is required.' ||
    error.message === 'Enter a valid email address.' ||
    error.message === 'Another account already uses this email address.' ||
    error.message === 'Invalid user ID.' ||
    error.message === 'Invalid user role.'
  ) {
    return error.message;
  }

  return 'Unable to update user profile. Please try again.';
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  try {
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
  } catch (error) {
    console.error('Admin user role update failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateAdminUserAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireAdmin();
  const adminId = admin.id;
  let userId: number | undefined;

  try {
    userId = parseUserId(formData);
    const role = parseRole(formData);
    const status = parseStatus(formData);
    const permission = await canChangeUserRole(admin.id, userId, role);

    if (!permission.allowed) {
      return state('error', permission.message);
    }

    if (admin.id === userId && status === 'inactive') {
      return state('error', 'You cannot deactivate your own account.');
    }

    const currentUser = await db.query.users.findFirst({ where: eq(users.id, userId) });

    if (!currentUser) {
      return state('error', 'User could not be found.');
    }

    const avatarFile = fileFromFormData(formData);
    const removeAvatar = formData.get('removeAvatar') === 'on';
    let avatarUrl: string | null = removeAvatar ? null : currentUser.avatarUrl;

    if (avatarFile) {
      const validationError = validateR2ImageFile(avatarFile);

      if (validationError) {
        return state('error', validationError);
      }

      const upload = await uploadR2Image(avatarFile, 'avatars');
      avatarUrl = upload.imageUrl;
    }

    await updateAdminUserProfile(userId, {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      displayName: String(formData.get('displayName') ?? ''),
      email: String(formData.get('email') ?? ''),
      bio: String(formData.get('bio') ?? ''),
      avatarUrl,
      role,
      status,
    });

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath('/');

    return state('success', 'User updated successfully.');
  } catch (error) {
    logAdminUserUpdateError(error, { adminId, userId });
    return state('error', updateErrorMessage(error));
  }
}

export async function resetAdminUserPasswordAction(
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  try {
    await requireAdmin();
    const userId = parseUserId(formData);

    await resetAdminUserPassword(userId, String(formData.get('password') ?? ''));

    revalidatePath(`/admin/users/${userId}`);
    return state('success', 'Password reset successfully.');
  } catch (error) {
    return state('error', error instanceof Error ? error.message : 'Could not reset password.');
  }
}

export async function toggleUserStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  try {
    const userId = parseUserId(formData);

    if (admin.id === userId) {
      throw new Error('You cannot deactivate your own account.');
    }

    await setAdminUserStatus(userId, parseStatus(formData));

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Admin user status update failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  try {
    const userId = parseUserId(formData);

    await deleteAdminUser(admin.id, userId);

    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Admin user deletion failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
