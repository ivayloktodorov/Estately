'use client';

import { useActionState } from 'react';
import { softUniLoginAction, type SoftUniAccountType, type SoftUniLoginState } from './actions';

const initialState: SoftUniLoginState = {
  status: 'idle',
  message: '',
};

const variants = {
  primary:
    'bg-estate-700 text-white shadow-estate-soft hover:bg-estate-800 focus-visible:ring-estate-700',
  secondary:
    'bg-brand-purple text-white shadow-estate-soft hover:bg-estate-600 focus-visible:ring-brand-purple',
  outline:
    'border border-stone-300 bg-white text-charcoal-900 hover:border-estate-300 hover:bg-estate-50 hover:text-estate-700 focus-visible:ring-estate-700',
};

interface SoftUniLoginButtonProps {
  accountType: SoftUniAccountType;
  children: string;
  className?: string;
  variant?: keyof typeof variants;
}

export function SoftUniLoginButton({
  accountType,
  children,
  className = '',
  variant = 'primary',
}: SoftUniLoginButtonProps) {
  const [state, formAction, pending] = useActionState(softUniLoginAction.bind(null, accountType), initialState);

  return (
    <form action={formAction} className={className}>
      <button
        className={`inline-flex min-h-11 w-full items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:text-white ${variants[variant]}`}
        disabled={pending}
        type="submit"
      >
        {pending ? 'Signing in...' : children}
      </button>
      {state.status === 'error' ? (
        <p className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
