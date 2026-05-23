import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getAdminUserDetails } from '@/lib/admin/users';
import { AdminUserManagementForm } from './admin-user-management-form';

/* eslint-disable @next/next/no-img-element */

interface AdminUserDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function initials(fullName: string): string {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={
        role === 'admin'
          ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200'
          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200'
      }
    >
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={
        status === 'active'
          ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200'
          : 'inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200'
      }
    >
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
}

export default async function AdminUserDetailsPage({ params }: AdminUserDetailsPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  const user = await getAdminUserDetails(userId);

  if (!user) {
    notFound();
  }

  const stats = [
    { label: 'Properties', value: user.propertiesCount },
    { label: 'Favorites', value: user.favoritesCount },
    { label: 'Inquiries', value: user.inquiriesCount },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-semibold text-slate-950" href="/admin">
            Estately Admin
          </Link>
          <Link className="text-sm font-medium text-slate-700 hover:text-emerald-700" href="/admin/users">
            Back to users
          </Link>
        </nav>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <img alt="" className="h-20 w-20 rounded-full object-cover" src={user.avatarUrl} />
              ) : (
                <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cream-100 text-2xl font-bold text-estate-700">
                  {initials(user.fullName)}
                </span>
              )}
              <div>
                <p className="font-mono text-xs text-slate-500">User #{user.id}</p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-950">{user.fullName}</h1>
                <p className="mt-1 text-slate-600">{user.email}</p>
                <div className="mt-3">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>
            <StatusBadge status={user.status} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Account details</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">Full name</dt>
              <dd className="mt-1 text-slate-950">{user.fullName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="mt-1 text-slate-950">{user.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Role</dt>
              <dd className="mt-1 text-slate-950">{user.role}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Status</dt>
              <dd className="mt-1 text-slate-950">{user.status}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Created At</dt>
              <dd className="mt-1 text-slate-950">{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Last Updated</dt>
              <dd className="mt-1 text-slate-950">{formatDate(user.updatedAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-500">Avatar</dt>
              <dd className="mt-1 text-slate-950">{user.avatarUrl ?? 'No avatar uploaded'}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-6">
          <AdminUserManagementForm actingAdminId={admin.id} user={user} />
        </section>
      </div>
    </main>
  );
}
