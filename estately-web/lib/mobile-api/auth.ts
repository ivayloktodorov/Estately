import type { NextRequest } from 'next/server';
import { authService } from '@/lib/auth/service';
import { verifyAuthToken } from '@/lib/auth/jwt';
import type { AuthUser } from '@/lib/auth/types';

const BEARER_PREFIX = 'Bearer ';

export async function getMobileAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith(BEARER_PREFIX)) {
    return null;
  }

  const token = authorization.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    return null;
  }

  return authService.getUserById(payload.userId);
}
