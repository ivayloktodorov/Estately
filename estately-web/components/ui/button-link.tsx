import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-charcoal-950 text-white shadow-estate-soft hover:bg-charcoal-800 focus-visible:ring-charcoal-900',
  secondary:
    'bg-estate-700 text-white shadow-estate-soft hover:bg-estate-800 focus-visible:ring-estate-700',
  outline:
    'border border-stone-300 bg-white text-charcoal-900 hover:border-charcoal-900 hover:bg-cream-50 focus-visible:ring-charcoal-900',
  ghost: 'text-stone-700 hover:bg-cream-100 hover:text-charcoal-950 focus-visible:ring-stone-500',
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
