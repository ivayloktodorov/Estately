import { NextRequest } from 'next/server';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileOptions, mobileSuccess } from '@/lib/mobile-api/responses';
import { changeUserPassword } from '@/lib/users/profile';

export async function PATCH(request: NextRequest) {
  let user;

  try {
    user = await getMobileAuthUser(request);
  } catch {
    return mobileError('Authentication required.', 401, request);
  }

  if (!user) return mobileError('Authentication required.', 401, request);

  try {
    const body = await request.json();
    await changeUserPassword(user.id, {
      currentPassword: String(body.currentPassword ?? ''),
      newPassword: String(body.newPassword ?? ''),
      confirmPassword: String(body.confirmPassword ?? ''),
    });

    return mobileSuccess({ changed: true }, 200, request);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return mobileError('Invalid password change request.', 400, request);
    }

    return mobileError(error instanceof Error ? error.message : 'Could not change password.', 400, request);
  }
}

export const POST = PATCH;
export const OPTIONS = mobileOptions;
