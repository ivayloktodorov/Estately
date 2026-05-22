'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction } from '@/lib/auth/actions';
import type { AuthActionState } from '@/lib/auth/types';

const initialState: AuthActionState = {
  status: 'idle',
  message: '',
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="w-full max-w-md space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.fields?.email}
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      {state.status === 'error' ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-md bg-emerald-700 px-5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-slate-600">
        New to Estately?{' '}
        <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
