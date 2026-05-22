import type { UserRole } from './types';
import { USER_ROLES } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateRegisterInput(input: RegisterInput): RegisterInput {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Enter a valid email address.');
  }

  if (fullName.length < 2) {
    throw new Error('Enter your full name.');
  }

  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  return { email, fullName, password: input.password };
}

export function validateLoginInput(input: LoginInput): LoginInput {
  const email = normalizeEmail(input.email);

  if (!EMAIL_PATTERN.test(email) || input.password.length === 0) {
    throw new Error('Enter your email and password.');
  }

  return { email, password: input.password };
}

export function parseUserRole(role: string): UserRole {
  return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : 'user';
}
