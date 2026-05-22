import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-800 focus-visible:ring-emerald-700',
  secondary:
    'border border-slate-300 bg-white text-slate-900 hover:border-emerald-700 hover:text-emerald-800 focus-visible:ring-emerald-700',
  ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-500',
};

export function ButtonLink({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
