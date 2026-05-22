'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerAction } from '@/lib/auth/actions';
import type { AuthActionState } from '@/lib/auth/types';

const initialState: AuthActionState = {
  status: 'idle',
  message: '',
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="w-full space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
          Full name
        </label>
        <input
          autoComplete="name"
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={state.fields?.fullName}
          id="fullName"
          name="fullName"
          required
          type="text"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          defaultValue={state.fields?.email}
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="password"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </div>
      {state.status === 'error' ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <button
        className="h-12 w-full rounded-md bg-emerald-700 px-5 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
