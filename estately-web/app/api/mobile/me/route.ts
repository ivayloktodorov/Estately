import { NextRequest } from 'next/server';
import { createActivity } from '@/lib/activity/service';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { getUserProfile, updateUserProfile } from '@/lib/users/profile';

function nameParts(fullName: string) {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') || firstName };
}

function safeProfileError(error: unknown): string {
  if (error instanceof Error && [
    'First name is required.',
    'Last name is required.',
    'Enter a valid email address.',
    'Another account already uses this email address.',
  ].includes(error.message)) {
    return error.message;
  }

  return 'Unable to update profile. Please try again.';
}

export async function GET(request: NextRequest) {
  try {
    const user = await getMobileAuthUser(request);

    if (!user) return mobileError('Authentication required.', 401);

    return mobileSuccess(user);
  } catch {
    return mobileError('Authentication required.', 401);
  }
}

export async function PATCH(request: NextRequest) {
  let user;

  try {
    user = await getMobileAuthUser(request);
  } catch {
    return mobileError('Authentication required.', 401);
  }

  if (!user) return mobileError('Authentication required.', 401);

  try {
    const profile = await getUserProfile(user.id);
    const body = await request.json();

    if (!profile) return mobileError('Profile could not be found.', 404);

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : profile.fullName;
    const email = typeof body.email === 'string' ? body.email.trim() : profile.email;
    const parts = nameParts(fullName);

    await updateUserProfile(user.id, {
      firstName: parts.firstName,
      lastName: parts.lastName,
      displayName: profile.displayName ?? '',
      email,
      bio: profile.bio ?? '',
      avatarUrl: profile.avatarUrl,
    });
    await createActivity({
      userId: user.id,
      type: 'profile_updated',
      title: 'Profile updated',
      description: 'You updated your profile details from mobile.',
      entityType: 'user',
      entityId: user.id,
    });

    const updatedProfile = await getUserProfile(user.id);
    return mobileSuccess(updatedProfile);
  } catch (error) {
    return mobileError(safeProfileError(error), 400);
  }
}
