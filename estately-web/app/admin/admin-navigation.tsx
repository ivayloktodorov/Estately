import Link from 'next/link';

type AdminNavigationSection = 'properties' | 'users' | 'messages' | 'dashboard';

interface AdminNavigationProps {
  active: AdminNavigationSection;
}

const adminLinks: { href: string; label: string; section: AdminNavigationSection }[] = [
  { href: '/admin/properties', label: 'Properties', section: 'properties' },
  { href: '/admin/users', label: 'Users', section: 'users' },
  { href: '/admin/messages', label: 'Messages', section: 'messages' },
  { href: '/admin', label: 'Dashboard', section: 'dashboard' },
];

export function AdminNavigation({ active }: AdminNavigationProps) {
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
                    ? 'border-emerald-800 bg-emerald-800 text-white hover:bg-emerald-900'
                    : 'border-slate-200 bg-white text-slate-950 hover:border-emerald-300 hover:text-emerald-700'
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
