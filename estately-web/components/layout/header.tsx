import Link from 'next/link';
import type { AuthUser } from '@/lib/auth/types';
import { getUnreadNotificationCount, getUserNotifications } from '@/lib/notifications/service';
import { ButtonLink } from '@/components/ui/button-link';
import { HeaderMobileMenu } from './mobile-menu-toggle';
import { NotificationDropdown } from './notification-dropdown';
import { ProfileDropdown } from './profile-dropdown';

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

export async function Header({ user }: HeaderProps) {
  const notificationData = user
    ? await Promise.all([getUserNotifications(user.id, 5), getUnreadNotificationCount(user.id)])
    : null;
  const notificationProps = notificationData
    ? { initialNotifications: notificationData[0], initialUnreadCount: notificationData[1] }
    : null;

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
          <div className="hidden shrink-0 items-center lg:flex">
            {user ? (
              <div className="flex flex-nowrap items-center gap-2">
                <ButtonLink className="h-10 min-h-0 whitespace-nowrap rounded-md px-4 py-2" href="/softuni-exam" variant="secondary">
                  SoftUni Exam
                </ButtonLink>
                {notificationProps ? <NotificationDropdown {...notificationProps} /> : null}
                <ProfileDropdown user={user} />
              </div>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost">
                  Login
                </ButtonLink>
                <ButtonLink href="/register">Register</ButtonLink>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <HeaderMobileMenu
            initialNotifications={notificationProps?.initialNotifications ?? []}
            initialUnreadCount={notificationProps?.initialUnreadCount ?? 0}
            user={user}
            publicLinks={publicLinks}
          />
        </div>
      </div>
    </header>
  );
}
