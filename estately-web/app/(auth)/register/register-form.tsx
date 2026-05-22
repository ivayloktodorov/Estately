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
    <form action={formAction} className="w-full space-y-6">
      <div>
        <label className="block text-sm font-semibold text-charcoal-950 mb-2" htmlFor="fullName">
          Full name
        </label>
        <input
          autoComplete="name"
          className="w-full h-11 rounded-lg border border-stone-300 bg-white px-4 text-base text-charcoal-950 placeholder-stone-400 transition focus:border-estate-700 focus:ring-2 focus:ring-estate-700/20"
          defaultValue={state.fields?.fullName}
          id="fullName"
          name="fullName"
          placeholder="John Doe"
          required
          type="text"
        />
      </div>
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
          autoComplete="new-password"
          className="w-full h-11 rounded-lg border border-stone-300 bg-white px-4 text-base text-charcoal-950 placeholder-stone-400 transition focus:border-estate-700 focus:ring-2 focus:ring-estate-700/20"
          id="password"
          minLength={6}
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
        className="w-full h-11 rounded-lg bg-charcoal-950 px-5 font-semibold text-white shadow-estate-soft transition hover:bg-charcoal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-center text-sm text-stone-600">
        Already have an account?{' '}
        <Link className="font-semibold text-estate-700 hover:text-estate-800 transition" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
