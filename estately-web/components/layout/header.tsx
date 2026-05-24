import Link from 'next/link';
import Image from 'next/image';
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
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export async function Header({ user }: HeaderProps) {
  const notificationData = user
    ? await Promise.allSettled([getUserNotifications(user.id, 5), getUnreadNotificationCount(user.id)])
    : null;
  const notificationProps =
    notificationData?.[0].status === 'fulfilled' && notificationData[1].status === 'fulfilled'
      ? { initialNotifications: notificationData[0].value, initialUnreadCount: notificationData[1].value }
      : null;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-cream-50 shadow-sm">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-3">
          {/* Logo */}
          <Link
            aria-label="Estately home"
            className="shrink-0 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            href="/"
          >
            <Image
              alt="Estately"
              className="h-auto w-28 object-contain sm:w-[190px]"
              height={96}
              priority
              src="/branding/logo-full.png?v=2"
              unoptimized
              width={360}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary navigation" className="hidden flex-1 items-center justify-center lg:flex gap-1">
            {publicLinks.map((link) => (
              <Link
                className="px-4 py-2 text-sm font-medium text-stone-600 transition hover:text-estate-700 rounded-md hover:bg-estate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700"
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
          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
            {user ? (
              <>
                {notificationProps ? (
                  <NotificationDropdown
                    className="shrink-0"
                    initialNotifications={notificationProps.initialNotifications}
                    initialUnreadCount={notificationProps.initialUnreadCount}
                  />
                ) : null}
                <ProfileDropdown className="min-w-0 max-w-[9.5rem] sm:max-w-none" user={user} />
              </>
            ) : null}
            <HeaderMobileMenu user={user} publicLinks={publicLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
