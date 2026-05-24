import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-estate-700 text-white shadow-estate-soft hover:bg-estate-800 focus-visible:ring-estate-700',
  secondary:
    'bg-brand-purple text-white shadow-estate-soft hover:bg-estate-600 focus-visible:ring-brand-purple',
  outline:
    'border border-stone-300 bg-white text-charcoal-900 hover:border-estate-300 hover:bg-estate-50 hover:text-estate-700 focus-visible:ring-estate-700',
  ghost: 'text-stone-700 hover:bg-estate-50 hover:text-estate-700 focus-visible:ring-estate-700',
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
