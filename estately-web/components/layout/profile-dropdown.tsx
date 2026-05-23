'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AuthUser } from '@/lib/auth/types';
import { LogoutButton } from './logout-button';

interface ProfileDropdownProps {
  user: AuthUser;
  align?: 'right' | 'left';
  className?: string;
}

const profileLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/properties', label: 'My Properties' },
  { href: '/dashboard/properties/new', label: 'Add Property' },
  { href: '/dashboard/inquiries', label: 'Inquiries' },
  { href: '/profile', label: 'Profile' },
  { href: '/favorites', label: 'Favorites' },
];

export function ProfileDropdown({ align = 'right', className = '', user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-charcoal-950 shadow-sm transition hover:border-charcoal-900 hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{user.fullName}</span>
        <span aria-hidden="true" className="text-xs text-stone-500">
          v
        </span>
      </button>

      <div
        className={`absolute top-full z-50 w-52 pt-2 ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${isOpen ? 'block' : 'hidden group-hover:block'}`}
        role="menu"
      >
        <div className="rounded-lg border border-stone-200 bg-white py-2 shadow-xl shadow-slate-900/10">
          {profileLinks.map((link) => (
            <Link
              className="block px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-cream-50 hover:text-estate-700"
              href={link.href}
              key={link.href}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-stone-200 px-2 pt-2">
            <LogoutButton
              className="min-h-0 h-10 justify-start rounded-md border-transparent bg-white px-2.5 py-2 text-left text-red-600 hover:border-transparent hover:bg-red-50 hover:text-red-700"
              formClassName="w-full"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
