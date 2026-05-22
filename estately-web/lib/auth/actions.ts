'use server';

import { redirect } from 'next/navigation';
import { AuthError } from './errors';
import { authService } from './service';
import { clearAuthSession, createAuthSession } from './session';
import type { AuthActionState } from './types';

const genericError = 'Something went wrong. Please try again.';

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function errorState(error: unknown, fields?: AuthActionState['fields']): AuthActionState {
  if (error instanceof AuthError) {
    return { status: 'error', message: error.message, fields };
  }

  return { status: 'error', message: genericError, fields };
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fields = {
    email: formValue(formData, 'email'),
    fullName: formValue(formData, 'fullName'),
  };

  try {
    const user = await authService.register({
      ...fields,
      password: formValue(formData, 'password'),
    });

    await createAuthSession(user);
  } catch (error) {
    return errorState(error, fields);
  }

  redirect('/dashboard');
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fields = {
    email: formValue(formData, 'email'),
  };

  try {
    const user = await authService.login({
      email: fields.email,
      password: formValue(formData, 'password'),
    });

    await createAuthSession(user);
  } catch (error) {
    return errorState(error, fields);
  }

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await clearAuthSession();
  redirect('/login');
}
