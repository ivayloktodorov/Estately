import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { authService } from './service';
import { signAuthToken, verifyAuthToken } from './jwt';
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_EXPIRES_IN_SECONDS,
  type AuthUser,
} from './types';

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: AUTH_TOKEN_EXPIRES_IN_SECONDS,
    path: '/',
  };
}

export async function createAuthSession(user: AuthUser): Promise<void> {
  const token = await signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  (await cookies()).set(AUTH_COOKIE_NAME, token, getCookieOptions());
}

export async function clearAuthSession(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    return null;
  }

  return authService.getUserById(payload.userId);
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    notFound();
  }

  return user;
}
