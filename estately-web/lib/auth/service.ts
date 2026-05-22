import { eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';
import { AuthError } from './errors';
import { hashPassword, verifyPassword } from './password';
import {
  parseUserRole,
  validateLoginInput,
  validateRegisterInput,
  type LoginInput,
  type RegisterInput,
} from './validation';
import type { AuthUser } from './types';

function toAuthUser(user: typeof users.$inferSelect): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: parseUserRole(user.role),
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthUser> {
    let validated: RegisterInput;

    try {
      validated = validateRegisterInput(input);
    } catch (error) {
      throw new AuthError('INVALID_INPUT', error instanceof Error ? error.message : 'Invalid input.');
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });

    if (existingUser) {
      throw new AuthError('DUPLICATE_EMAIL', 'An account with this email already exists.');
    }

    const passwordHash = await hashPassword(validated.password);
    const [createdUser] = await db
      .insert(users)
      .values({
        email: validated.email,
        fullName: validated.fullName,
        passwordHash,
        role: 'user',
      })
      .returning();

    if (!createdUser) {
      throw new AuthError('INVALID_INPUT', 'Could not create account.');
    }

    return toAuthUser(createdUser);
  },

  async login(input: LoginInput): Promise<AuthUser> {
    let validated: LoginInput;

    try {
      validated = validateLoginInput(input);
    } catch (error) {
      throw new AuthError('INVALID_INPUT', error instanceof Error ? error.message : 'Invalid input.');
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });

    if (!user || !(await verifyPassword(validated.password, user.passwordHash))) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    return toAuthUser(user);
  },

  async getUserById(userId: number): Promise<AuthUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user ? toAuthUser(user) : null;
  },
};
