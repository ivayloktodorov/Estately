'use client';

import { logoutAction } from '@/lib/auth/actions';

interface LogoutButtonProps {
  className?: string;
  formClassName?: string;
  onClick?: () => void;
}

export function LogoutButton({ className = '', formClassName = 'w-full', onClick }: LogoutButtonProps) {
  return (
    <form action={logoutAction} className={formClassName}>
      <button
        className={`inline-flex min-h-11 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-charcoal-900 hover:text-charcoal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2 ${className}`}
        onClick={onClick}
        type="submit"
      >
        Logout
      </button>
    </form>
  );
}
