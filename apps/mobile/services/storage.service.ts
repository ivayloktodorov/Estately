import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { AuthSession, AuthUser } from '@/types/auth';

const AUTH_TOKEN_KEY = 'estately_token';
const AUTH_USER_KEY = 'estately_user';
const STORAGE_TIMEOUT_MS = 1500;

function withTimeout<TValue>(promise: Promise<TValue>, fallback: TValue): Promise<TValue> {
  return Promise.race([
    promise,
    new Promise<TValue>((resolve) => {
      setTimeout(() => resolve(fallback), STORAGE_TIMEOUT_MS);
    }),
  ]);
}

function getWebStorageItem(key: string): string | null {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(key);
}

function setWebStorageItem(key: string, value: string): void {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

function removeWebStorageItem(key: string): void {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}

export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorageItem(AUTH_TOKEN_KEY);
  }

  return withTimeout(AsyncStorage.getItem(AUTH_TOKEN_KEY), null);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const userJson =
    Platform.OS === 'web'
      ? getWebStorageItem(AUTH_USER_KEY)
      : await withTimeout(AsyncStorage.getItem(AUTH_USER_KEY), null);

  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const [token, user] = await Promise.all([getStoredToken(), getStoredUser()]);

  return token && user ? { token, user } : null;
}

export async function storeSession(session: AuthSession): Promise<void> {
  if (Platform.OS === 'web') {
    setWebStorageItem(AUTH_TOKEN_KEY, session.token);
    setWebStorageItem(AUTH_USER_KEY, JSON.stringify(session.user));
    return;
  }

  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token),
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function clearStoredSession(): Promise<void> {
  if (Platform.OS === 'web') {
    removeWebStorageItem(AUTH_TOKEN_KEY);
    removeWebStorageItem(AUTH_USER_KEY);
    return;
  }

  await Promise.all([AsyncStorage.removeItem(AUTH_TOKEN_KEY), AsyncStorage.removeItem(AUTH_USER_KEY)]);
}
