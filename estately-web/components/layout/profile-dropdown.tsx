'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/offers', label: 'Offers' },
  { href: '/dashboard/activity', label: 'Activity' },
  { href: '/dashboard/saved-searches', label: 'Saved Searches' },
  { href: '/profile', label: 'Profile' },
  { href: '/favorites', label: 'Favorites' },
];

const adminLinks = [
  { href: '/admin', label: 'Admin Dashboard' },
  { href: '/admin/properties', label: 'Listing Moderation' },
  { href: '/admin/users', label: 'User Management' },
];

function userInitials(user: AuthUser): string {
  const name = user.fullName.trim();

  if (name) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  return user.email.trim()[0]?.toUpperCase() ?? 'U';
}

function displayName(user: AuthUser): string {
  return user.fullName.trim() || user.email;
}

function shortDisplayName(user: AuthUser): string {
  const name = user.fullName.trim();

  if (!name) {
    return user.email.split('@')[0] || user.email;
  }

  return name.split(/\s+/)[0] ?? name;
}

function UserAvatar({ user }: { user: AuthUser }) {
  const label = `${displayName(user)} avatar`;

  if (user.avatarUrl) {
    return (
      <Image
        alt={label}
        className="h-10 w-10 shrink-0 rounded-full border border-stone-200 bg-cream-100 object-cover shadow-sm"
        height={40}
        src={user.avatarUrl}
        width={40}
      />
    );
  }

  return (
    <span
      aria-label={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-estate-100 bg-estate-50 text-sm font-bold text-estate-800 shadow-sm"
      role="img"
    >
      {userInitials(user)}
    </span>
  );
}

export function ProfileDropdown({ align = 'right', className = '', user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const name = displayName(user);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex h-12 w-full min-w-0 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-stone-200 bg-white py-1 pl-1.5 pr-3 text-sm font-semibold text-charcoal-950 shadow-sm transition hover:border-estate-300 hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 sm:w-auto"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <UserAvatar user={user} />
        <span className="hidden max-w-36 truncate sm:inline lg:hidden">{shortDisplayName(user)}</span>
        <span className="hidden max-w-44 truncate lg:inline">{name}</span>
        <span aria-hidden="true" className={`text-xs text-stone-500 transition ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      <div
        className={`absolute top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top overflow-visible rounded-xl border border-stone-200 bg-white shadow-xl shadow-slate-900/10 transition duration-200 ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible -translate-y-1 scale-95 opacity-0'
        }`}
        role="menu"
      >
        <div className="rounded-xl">
          <div className="border-b border-stone-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar user={user} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-charcoal-950">{name}</p>
                <p className="truncate text-xs text-stone-500">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
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
          </div>
          {user.role === 'admin' ? (
            <div className="border-t border-stone-100 py-2">
              {adminLinks.map((link) => (
                <Link
                  className="block px-4 py-2.5 text-sm font-semibold text-estate-700 transition hover:bg-cream-50 hover:text-estate-800"
                  href={link.href}
                  key={link.href}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="border-t border-stone-100 p-2">
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
