'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logoutAction } from '@/lib/auth/actions';
import type { AuthUser } from '@/lib/auth/types';
import { ButtonLink } from '@/components/ui/button-link';
import { Container } from '@/components/ui/container';

interface HeaderProps {
  user: AuthUser | null;
}

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function LogoutButton({ className = '' }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold leading-none text-stone-700 transition hover:border-charcoal-900 hover:text-charcoal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2 ${className}`}
        type="submit"
      >
        Logout
      </button>
    </form>
  );
}

export function Header({ user }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-cream-50/95 backdrop-blur">
      <Container>
        <div className="flex min-h-20 items-center justify-between gap-6">
          <Link
            aria-label="Estately home"
            className="shrink-0 text-2xl font-semibold tracking-normal text-charcoal-950"
            href="/"
          >
            Estately
          </Link>

          <nav aria-label="Primary navigation" className="hidden flex-row items-center gap-8 lg:flex">
            {publicLinks.map((link) => (
              <Link
                className="text-sm font-medium text-stone-600 transition hover:text-charcoal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-4"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 flex-row items-center gap-3 lg:flex">
            {user ? (
              <>
                <ButtonLink href="/dashboard" variant="ghost">
                  Dashboard
                </ButtonLink>
                <ButtonLink href="/favorites" variant="outline">
                  Favorites
                </ButtonLink>
                <LogoutButton />
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost">
                  Login
                </ButtonLink>
                <ButtonLink href="/register">Register</ButtonLink>
              </>
            )}
          </div>

          <button
            aria-controls="mobile-navigation"
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 transition hover:border-charcoal-900 hover:text-charcoal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${open ? 'translate-y-2 rotate-45' : ''}`}
              />
              <span
                className={`absolute left-0 top-2 h-0.5 w-5 bg-current transition ${open ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 top-4 h-0.5 w-5 bg-current transition ${open ? '-translate-y-2 -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>

        <div
          className={`grid transition-all duration-200 lg:hidden ${open ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}
          id="mobile-navigation"
        >
          <div className="overflow-hidden">
            <nav aria-label="Mobile navigation" className="grid gap-1 border-t border-stone-200 pt-4">
              {publicLinks.map((link) => (
                <Link
                  className="rounded-md px-3 py-3 text-base font-medium text-stone-700 transition hover:bg-cream-100 hover:text-charcoal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900"
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid gap-3 border-t border-stone-200 pt-4 sm:grid-cols-3">
              {user ? (
                <>
                  <ButtonLink href="/dashboard" onClick={() => setOpen(false)} variant="outline">
                    Dashboard
                  </ButtonLink>
                  <ButtonLink href="/favorites" onClick={() => setOpen(false)} variant="outline">
                    Favorites
                  </ButtonLink>
                  <LogoutButton className="w-full" />
                </>
              ) : (
                <>
                  <ButtonLink href="/login" onClick={() => setOpen(false)} variant="outline">
                    Login
                  </ButtonLink>
                  <ButtonLink className="sm:col-span-2" href="/register" onClick={() => setOpen(false)}>
                    Register
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
