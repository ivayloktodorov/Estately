'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { AuthError } from '@/lib/auth/errors';
import { hashPassword } from '@/lib/auth/password';
import { authService } from '@/lib/auth/service';
import { createAuthSession } from '@/lib/auth/session';
import { db } from '@/src/db/client';
import { users } from '@/src/db/schema';

export type SoftUniAccountType = 'user' | 'admin';

export interface SoftUniLoginState {
  status: 'idle' | 'error';
  message: string;
}

const accounts: Record<SoftUniAccountType, { email: string; fullName: string; password: string; redirectPath: string; role: 'user' | 'admin' }> = {
  user: {
    email: 'softuni_user@estately.com',
    fullName: 'SoftUni User',
    password: 'pass123',
    redirectPath: '/dashboard',
    role: 'user',
  },
  admin: {
    email: 'softuni_admin@estately.com',
    fullName: 'SoftUni Admin',
    password: 'pass123',
    redirectPath: '/admin',
    role: 'admin',
  },
};

async function ensureSoftUniAccount(accountType: SoftUniAccountType): Promise<void> {
  const account = accounts[accountType];
  const existingUser = await db.query.users.findFirst({
    columns: { id: true },
    where: eq(users.email, account.email),
  });

  if (existingUser) {
    return;
  }

  await db
    .insert(users)
    .values({
      email: account.email,
      fullName: account.fullName,
      passwordHash: await hashPassword(account.password),
      role: account.role,
    })
    .onConflictDoNothing({ target: users.email });
}

export async function softUniLoginAction(
  accountType: SoftUniAccountType,
  prevState: SoftUniLoginState,
): Promise<SoftUniLoginState> {
  void prevState;

  const account = accounts[accountType];

  try {
    await ensureSoftUniAccount(accountType);

    const user = await authService.login({
      email: account.email,
      password: account.password,
    });

    await createAuthSession(user);
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: 'error',
        message: 'Could not sign in with this testing account. Please try again.',
      };
    }

    return {
      status: 'error',
      message: 'Something went wrong while signing in. Please try again.',
    };
  }

  redirect(account.redirectPath);
}
