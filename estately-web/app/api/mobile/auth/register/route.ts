import { NextRequest } from 'next/server';
import { AuthError } from '@/lib/auth/errors';
import { signAuthToken } from '@/lib/auth/jwt';
import { authService } from '@/lib/auth/service';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { mobileRegisterSchema, validationErrorMessage } from '@/lib/mobile-api/validation';

export async function POST(request: NextRequest) {
  try {
    const input = mobileRegisterSchema.parse(await request.json());
    const user = await authService.register(input);
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return mobileSuccess({ token, user }, 201);
  } catch (error) {
    const status = error instanceof AuthError && error.code === 'DUPLICATE_EMAIL' ? 409 : 400;

    return mobileError(validationErrorMessage(error), status);
  }
}
