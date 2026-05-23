import { eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';
import { AuthError } from './errors';
import { authTimer } from './performance';
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
    avatarUrl: user.avatarUrl,
    role: parseUserRole(user.role),
  };
}

type LoginUserRow = Pick<
  typeof users.$inferSelect,
  'id' | 'email' | 'passwordHash' | 'fullName' | 'avatarUrl' | 'role' | 'status'
>;

type SessionUserRow = Pick<
  typeof users.$inferSelect,
  'id' | 'email' | 'fullName' | 'avatarUrl' | 'role'
>;

function toAuthUserFromSessionRow(user: SessionUserRow): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
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
    const timer = authTimer('auth-service-login');
    let validated: LoginInput;

    try {
      validated = validateLoginInput(input);
      timer.mark('validated');
    } catch (error) {
      throw new AuthError('INVALID_INPUT', error instanceof Error ? error.message : 'Invalid input.');
    }

    const user: LoginUserRow | undefined = await db.query.users.findFirst({
      columns: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
      where: eq(users.email, validated.email),
    });
    timer.mark('user-lookup');

    if (!user || !(await verifyPassword(validated.password, user.passwordHash))) {
      timer.mark('password-compare');
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
    }
    timer.mark('password-compare');

    if (user.status === 'inactive') {
      throw new AuthError('INVALID_CREDENTIALS', 'This account is inactive. Contact an administrator.');
    }

    timer.end();
    return toAuthUserFromSessionRow(user);
  },

  async getUserById(userId: number): Promise<AuthUser | null> {
    const user: SessionUserRow | undefined = await db.query.users.findFirst({
      columns: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
      where: eq(users.id, userId),
    });

    return user ? toAuthUserFromSessionRow(user) : null;
  },
};
