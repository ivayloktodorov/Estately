'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/i18n/language-provider';
import { ButtonLink } from '@/components/ui/button-link';
import type { AuthUser } from '@/lib/auth/types';

interface MobileMenuToggleProps {
  user: AuthUser | null;
  publicLinks: { href: string; label: string }[];
}

export function HeaderMobileMenu({ user, publicLinks }: MobileMenuToggleProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Mobile Menu Button */}
      <button
        aria-controls="mobile-menu"
        aria-expanded={mobileMenuOpen}
        aria-label="Toggle navigation menu"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 transition hover:border-estate-300 hover:text-estate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 lg:hidden"
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
        <div id="mobile-menu" className="fixed left-0 right-0 top-20 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-stone-200 bg-cream-50 py-4 shadow-lg shadow-slate-900/5">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
            <nav aria-label="Mobile navigation" className="space-y-1">
              {publicLinks.map((link) => (
                <Link
                  className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 transition hover:bg-estate-50 hover:text-estate-700"
                  href={link.href}
                  key={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 border-t border-stone-200" />
              <Link
                className="block rounded-md bg-brand-purple px-3 py-2 text-base font-semibold text-white shadow-estate-soft transition hover:bg-estate-600"
                href="/softuni-exam"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('softUniExam')}
              </Link>
              {user ? (
                <>
                  <div className="my-3 border-t border-stone-200" />
                  <Link
                    className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 transition hover:bg-estate-50 hover:text-estate-700"
                    href="/dashboard/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('notifications')}
                  </Link>
                  <Link
                    className="block rounded-md px-3 py-2 text-base font-medium text-stone-700 transition hover:bg-estate-50 hover:text-estate-700"
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('profile')}
                  </Link>
                </>
              ) : null}
            </nav>

            {!user ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:flex-nowrap">
                <>
                  <ButtonLink className="flex-1" href="/login" onClick={() => setMobileMenuOpen(false)} variant="outline">
                    {t('login')}
                  </ButtonLink>
                  <ButtonLink className="flex-1" href="/register" onClick={() => setMobileMenuOpen(false)}>
                    {t('register')}
                  </ButtonLink>
                </>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
