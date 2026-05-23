import { apiRequest } from '@/services/api';
import { clearStoredSession, storeSession } from '@/services/storage.service';
import type { AuthSession, LoginInput, RegisterInput } from '@/types/auth';

export async function login(input: LoginInput): Promise<AuthSession> {
  const session = await apiRequest<AuthSession, LoginInput>('/auth/login', {
    method: 'POST',
    body: input,
  });

  await storeSession(session);

  return session;
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  const session = await apiRequest<AuthSession, RegisterInput>('/auth/register', {
    method: 'POST',
    body: input,
  });

  await storeSession(session);

  return session;
}

export async function logout(): Promise<void> {
  await clearStoredSession();
}
