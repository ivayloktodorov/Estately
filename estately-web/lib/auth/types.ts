export const AUTH_COOKIE_NAME = 'estately_session';
export const AUTH_TOKEN_EXPIRES_IN_SECONDS = 24 * 60 * 60;

export const USER_ROLES = ['user', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthActionState {
  status: 'idle' | 'error';
  message: string;
  fields?: {
    email?: string;
    fullName?: string;
  };
}
