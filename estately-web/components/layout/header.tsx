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
        className={`inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${className}`}
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <Container>
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link
            aria-label="Estately home"
            className="text-2xl font-semibold tracking-normal text-slate-950"
            href="/"
          >
            Estately
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
            {publicLinks.map((link) => (
              <Link
                className="text-sm font-medium text-slate-600 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-4"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <ButtonLink href="/dashboard" variant="ghost">
                  Dashboard
                </ButtonLink>
                <ButtonLink href="/favorites" variant="secondary">
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 lg:hidden"
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
            <nav aria-label="Mobile navigation" className="grid gap-1 border-t border-slate-100 pt-4">
              {publicLinks.map((link) => (
                <Link
                  className="rounded-md px-3 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
              {user ? (
                <>
                  <ButtonLink href="/dashboard" onClick={() => setOpen(false)} variant="secondary">
                    Dashboard
                  </ButtonLink>
                  <ButtonLink href="/favorites" onClick={() => setOpen(false)} variant="secondary">
                    Favorites
                  </ButtonLink>
                  <LogoutButton className="w-full" />
                </>
              ) : (
                <>
                  <ButtonLink href="/login" onClick={() => setOpen(false)} variant="secondary">
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
