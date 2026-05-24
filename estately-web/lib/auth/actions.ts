'use server';

import { redirect } from 'next/navigation';
import { AuthError } from './errors';
import { authTimer } from './performance';
import { authService } from './service';
import { clearAuthSession, createAuthSession } from './session';
import type { AuthActionState } from './types';

const genericError = 'Something went wrong. Please try again.';
const defaultRedirectPath = '/dashboard';

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

function redirectPath(formData: FormData): string {
  const value = formValue(formData, 'redirect') || formValue(formData, 'next');

  if (!value.startsWith('/') || value.startsWith('//')) {
    return defaultRedirectPath;
  }

  return value;
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fields = {
    email: formValue(formData, 'email'),
    fullName: formValue(formData, 'fullName'),
  };

  const targetPath = redirectPath(formData);

  try {
    const user = await authService.register({
      ...fields,
      password: formValue(formData, 'password'),
    });

    await createAuthSession(user);
  } catch (error) {
    return errorState(error, fields);
  }

  redirect(targetPath);
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const timer = authTimer('login-action');
  const fields = {
    email: formValue(formData, 'email'),
  };
  timer.mark('form-parsed');

  const targetPath = redirectPath(formData);

  try {
    const user = await authService.login({
      email: fields.email,
      password: formValue(formData, 'password'),
    });
    timer.mark('credentials-verified');

    await createAuthSession(user);
    timer.mark('session-created');
  } catch (error) {
    timer.end();
    return errorState(error, fields);
  }

  timer.end();
  redirect(targetPath);
}

export async function logoutAction(): Promise<void> {
  await clearAuthSession();
  redirect('/login');
}
