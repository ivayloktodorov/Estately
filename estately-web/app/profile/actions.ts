'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { changeUserPassword, getUserProfile, updateUserProfile } from '@/lib/users/profile';
import { createActivity } from '@/lib/activity/service';
import { uploadR2Image, validateR2ImageFile } from '@/services/storage/r2';

export interface ProfileActionState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

const initialState: ProfileActionState = {
  status: 'idle',
  message: '',
};

function state(status: ProfileActionState['status'], message: string): ProfileActionState {
  return { status, message };
}

function fileFromFormData(formData: FormData): File | null {
  const file = formData.get('avatar');
  return file instanceof File && file.size > 0 ? file : null;
}

function isR2ConfigurationError(error: Error): boolean {
  return error.message.includes('R2_') || error.message.includes('CLOUDFLARE_R2_');
}

function profileErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Unable to update profile. Please try again.';
  }

  if (isR2ConfigurationError(error)) {
    return 'Avatar uploads are not configured. Please contact support.';
  }

  if (
    error.message === 'Image must be 5MB or smaller.' ||
    error.message === 'Only JPG, JPEG, PNG, and WEBP images are allowed.' ||
    error.message === 'Please choose an image file to upload.' ||
    error.message === 'First name is required.' ||
    error.message === 'Last name is required.' ||
    error.message === 'Enter a valid email address.' ||
    error.message === 'Another account already uses this email address.'
  ) {
    return error.message;
  }

  return 'Unable to update profile. Please try again.';
}

export async function updateProfileAction(
  previousState: ProfileActionState = initialState,
  formData: FormData,
): Promise<ProfileActionState> {
  void previousState;

  const user = await requireAuth();

  try {
    const currentProfile = await getUserProfile(user.id);

    if (!currentProfile) {
      return state('error', 'Profile could not be found.');
    }

    const avatarFile = fileFromFormData(formData);
    const removeAvatar = formData.get('removeAvatar') === 'on';
    let avatarUrl: string | null = removeAvatar ? null : currentProfile.avatarUrl;

    if (avatarFile) {
      const validationError = validateR2ImageFile(avatarFile);

      if (validationError) {
        return state('error', validationError);
      }

      const upload = await uploadR2Image(avatarFile, 'avatars');
      avatarUrl = upload.imageUrl;
    }

    await updateUserProfile(user.id, {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      displayName: String(formData.get('displayName') ?? ''),
      email: String(formData.get('email') ?? ''),
      bio: String(formData.get('bio') ?? ''),
      avatarUrl,
    });
    await createActivity({
      userId: user.id,
      type: 'profile_updated',
      title: 'Profile updated',
      description: 'You updated your profile details.',
      entityType: 'user',
      entityId: user.id,
    });

    revalidatePath('/profile');
    revalidatePath('/');

    return state('success', 'Profile updated successfully.');
  } catch (error) {
    console.error('Profile update failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return state('error', profileErrorMessage(error));
  }
}

export async function changePasswordAction(
  previousState: ProfileActionState = initialState,
  formData: FormData,
): Promise<ProfileActionState> {
  void previousState;

  try {
    const user = await requireAuth();

    await changeUserPassword(user.id, {
      currentPassword: String(formData.get('currentPassword') ?? ''),
      newPassword: String(formData.get('newPassword') ?? ''),
      confirmPassword: String(formData.get('confirmPassword') ?? ''),
    });

    return state('success', 'Password changed successfully.');
  } catch (error) {
    return state('error', error instanceof Error ? error.message : 'Could not change password.');
  }
}
