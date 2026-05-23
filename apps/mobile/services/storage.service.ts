import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthUser } from '@/types/auth';

const AUTH_TOKEN_KEY = 'estately_token';
const AUTH_USER_KEY = 'estately_user';

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);

  return userJson ? (JSON.parse(userJson) as AuthUser) : null;
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const [token, user] = await Promise.all([getStoredToken(), getStoredUser()]);

  return token && user ? { token, user } : null;
}

export async function storeSession(session: AuthSession): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token),
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function clearStoredSession(): Promise<void> {
  await Promise.all([AsyncStorage.removeItem(AUTH_TOKEN_KEY), AsyncStorage.removeItem(AUTH_USER_KEY)]);
}
