import { NextRequest } from 'next/server';
import { createActivity } from '@/lib/activity/service';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { getUserProfile, updateUserProfile } from '@/lib/users/profile';
import { uploadR2Image, validateR2ImageFile } from '@/services/storage/r2';

const DATA_URL_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/;

function fileFromDataUrl(dataUrl: string, fileName = 'avatar'): File | null {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) return null;

  const [, type, data] = match;
  const bytes = Uint8Array.from(Buffer.from(data, 'base64'));
  const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';

  return new File([bytes], `${fileName}.${extension}`, { type });
}

export async function POST(request: NextRequest) {
  const user = await getMobileAuthUser(request);

  if (!user) return mobileError('Authentication required.', 401);

  try {
    const profile = await getUserProfile(user.id);
    const body = await request.json();
    const file = fileFromDataUrl(String(body.dataUrl ?? ''), String(body.fileName ?? 'avatar'));

    if (!profile) return mobileError('Profile could not be found.', 404);
    if (!file) return mobileError('Only JPG, JPEG, PNG, and WEBP images are allowed.', 400);

    const validationError = validateR2ImageFile(file);
    if (validationError) return mobileError(validationError, 400);

    const upload = await uploadR2Image(file, 'avatars');
    await updateUserProfile(user.id, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName ?? '',
      email: profile.email,
      bio: profile.bio ?? '',
      avatarUrl: upload.imageUrl,
    });
    await createActivity({
      userId: user.id,
      type: 'profile_updated',
      title: 'Profile updated',
      description: 'You updated your avatar from mobile.',
      entityType: 'user',
      entityId: user.id,
    });

    return mobileSuccess({ avatarUrl: upload.imageUrl });
  } catch {
    return mobileError('Unable to upload avatar. Please try again.', 400);
  }
}
