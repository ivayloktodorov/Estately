export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}
