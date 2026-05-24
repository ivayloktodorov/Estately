'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction } from '@/lib/auth/actions';
import type { AuthActionState } from '@/lib/auth/types';

const initialState: AuthActionState = {
  status: 'idle',
  message: '',
};

interface LoginFormProps {
  redirectTo?: string;
}

function authHref(pathname: '/login' | '/register', redirectTo?: string): string {
  if (!redirectTo) {
    return pathname;
  }

  const params = new URLSearchParams({ redirect: redirectTo });
  return `${pathname}?${params.toString()}`;
}

export function LoginForm({ redirectTo = '' }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="w-full space-y-6">
      <input name="redirect" type="hidden" value={redirectTo} />
      <div>
        <label className="block text-sm font-semibold text-charcoal-950 mb-2" htmlFor="email">
          Email address
        </label>
        <input
          autoComplete="email"
          className="w-full h-11 rounded-lg border border-stone-300 bg-white px-4 text-base text-charcoal-950 placeholder-stone-400 transition focus:border-estate-700 focus:ring-2 focus:ring-estate-700/20"
          defaultValue={state.fields?.email}
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-charcoal-950 mb-2" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="w-full h-11 rounded-lg border border-stone-300 bg-white px-4 text-base text-charcoal-950 placeholder-stone-400 transition focus:border-estate-700 focus:ring-2 focus:ring-estate-700/20"
          id="password"
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />
      </div>
      {state.status === 'error' ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <button
        className="w-full h-11 rounded-lg bg-estate-700 px-5 font-semibold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-stone-600">
        New to Estately?{' '}
        <Link className="font-semibold text-estate-700 hover:text-estate-800 transition" href={authHref('/register', redirectTo)}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
