import { NextRequest } from 'next/server';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { changeUserPassword } from '@/lib/users/profile';

export async function POST(request: NextRequest) {
  const user = await getMobileAuthUser(request);

  if (!user) return mobileError('Authentication required.', 401);

  try {
    const body = await request.json();
    await changeUserPassword(user.id, {
      currentPassword: String(body.currentPassword ?? ''),
      newPassword: String(body.newPassword ?? ''),
      confirmPassword: String(body.confirmPassword ?? ''),
    });

    return mobileSuccess({ changed: true });
  } catch (error) {
    return mobileError(error instanceof Error ? error.message : 'Could not change password.', 400);
  }
}
