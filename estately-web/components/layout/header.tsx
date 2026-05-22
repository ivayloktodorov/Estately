'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logoutAction } from '@/lib/auth/actions';
import type { AuthUser } from '@/lib/auth/types';
import { ButtonLink } from '@/components/ui/button-link';

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

function LogoutButton({ className = '', onClick }: { className?: string; onClick?: () => void }) {
  return (
    <form action={logoutAction} className="w-full">
      <button
        className={`w-full inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-charcoal-900 hover:text-charcoal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2 ${className}`}
        onClick={onClick}
        type="submit"
      >
        Logout
      </button>
    </form>
  );
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-cream-50 shadow-sm">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            aria-label="Estately home"
            className="shrink-0 text-2xl font-bold tracking-tight text-charcoal-950 hover:text-estate-700 transition"
            href="/"
          >
            Estately
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary navigation" className="hidden flex-1 items-center justify-center lg:flex gap-1">
            {publicLinks.map((link) => (
              <Link
                className="px-4 py-2 text-sm font-medium text-stone-600 transition hover:text-charcoal-950 rounded-md hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
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

          {/* Mobile Menu Button */}
          <button
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 transition hover:border-charcoal-900 hover:text-charcoal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-5 w-5">
              <span
                className={`absolute left-0 top-1 block h-0.5 w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'translate-y-2.5 rotate-45' : ''}`}
              />
              <span
                className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 top-4 block h-0.5 w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-translate-y-2.5 -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-stone-200 py-4 lg:hidden">
            <nav aria-label="Mobile navigation" className="mb-4 space-y-1">
              {publicLinks.map((link) => (
                <Link
                  className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 transition hover:bg-cream-100 hover:text-charcoal-950"
                  href={link.href}
                  key={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row">
              {user ? (
                <>
                  <ButtonLink className="flex-1" href="/dashboard" onClick={() => setMobileMenuOpen(false)} variant="outline">
                    Dashboard
                  </ButtonLink>
                  <ButtonLink className="flex-1" href="/favorites" onClick={() => setMobileMenuOpen(false)} variant="outline">
                    Favorites
                  </ButtonLink>
                  <LogoutButton className="flex-1" onClick={() => setMobileMenuOpen(false)} />
                </>
              ) : (
                <>
                  <ButtonLink className="flex-1" href="/login" onClick={() => setMobileMenuOpen(false)} variant="outline">
                    Login
                  </ButtonLink>
                  <ButtonLink className="flex-1" href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
