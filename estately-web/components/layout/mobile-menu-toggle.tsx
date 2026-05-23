'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';
import { ProfileDropdown } from './profile-dropdown';
import type { AuthUser } from '@/lib/auth/types';

interface MobileMenuToggleProps {
  user: AuthUser | null;
  publicLinks: { href: string; label: string }[];
}

export function HeaderMobileMenu({ user, publicLinks }: MobileMenuToggleProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
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

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="absolute left-0 right-0 top-full border-t border-stone-200 bg-cream-50 py-4">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
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
            <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:flex-nowrap">
              {user ? (
                <>
                  <ButtonLink className="h-11 flex-1 whitespace-nowrap px-4" href="/softuni-exam" onClick={() => setMobileMenuOpen(false)} variant="secondary">
                    SoftUni Exam
                  </ButtonLink>
                  <ProfileDropdown align="right" className="flex-1" user={user} />
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
        </div>
      )}
    </>
  );
}
