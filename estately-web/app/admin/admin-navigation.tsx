import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';

type AdminNavigationSection = 'properties' | 'users' | 'messages' | 'dashboard';

interface AdminNavigationProps {
  active: AdminNavigationSection;
}

export async function AdminNavigation({ active }: AdminNavigationProps) {
  const t = await getTranslations();
  const adminLinks: { href: string; label: string; section: AdminNavigationSection }[] = [
    { href: '/admin/properties', label: t.listingModeration, section: 'properties' },
    { href: '/admin/users', label: t.userManagement, section: 'users' },
    { href: '/admin/messages', label: t.messages, section: 'messages' },
    { href: '/admin', label: t.adminDashboard, section: 'dashboard' },
  ];

  return (
    <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link className="shrink-0 text-xl font-semibold text-slate-950" href="/admin">
        Estately Admin
      </Link>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max items-center gap-3">
          {adminLinks.map((link) => {
            const isActive = link.section === active;

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-12 items-center justify-center rounded-lg border px-6 text-sm font-semibold shadow-sm transition ${
                  isActive
                    ? 'border-estate-800 bg-estate-800 text-white hover:bg-estate-900'
                    : 'border-slate-200 bg-white text-slate-950 hover:border-estate-300 hover:text-estate-700'
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
