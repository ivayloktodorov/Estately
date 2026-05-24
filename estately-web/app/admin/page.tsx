import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import {
  getAdminOverview,
  type RecentAdminInquiry,
  type RecentAdminProperty,
  type RecentAdminUser,
} from '@/lib/admin/overview';
import { AdminNavigation } from './admin-navigation';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatPrice(price: string): string {
  return `$${Number(price).toLocaleString()}`;
}

function preview(message: string): string {
  return message.length > 92 ? `${message.slice(0, 92)}...` : message;
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={
        role === 'admin'
          ? 'inline-flex rounded-full bg-estate-50 px-2.5 py-1 text-xs font-semibold text-estate-700 ring-1 ring-estate-200'
          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200'
      }
    >
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'approved'
      ? 'bg-estate-50 text-estate-700 ring-estate-200'
      : status === 'rejected'
        ? 'bg-red-50 text-red-700 ring-red-200'
        : 'bg-amber-50 text-amber-700 ring-amber-200';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-600">
      {children}
    </div>
  );
}

function RecentUsers({ users }: { users: RecentAdminUser[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">Recent users</h2>
        <Link className="text-sm font-semibold text-estate-700 hover:text-estate-800" href="/admin/users">
          View all
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {users.length > 0 ? (
          users.map((user) => (
            <article
              className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
              key={user.id}
            >
              <div>
                <Link className="font-semibold text-slate-950 hover:text-estate-700" href={`/admin/users/${user.id}`}>
                  {user.fullName}
                </Link>
                <p className="mt-1 text-sm text-slate-600">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <RoleBadge role={user.role} />
                <span className="text-sm text-slate-500">{formatDate(user.createdAt)}</span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState>No recent users found.</EmptyState>
        )}
      </div>
    </section>
  );
}

function RecentProperties({ properties }: { properties: RecentAdminProperty[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">Recent properties</h2>
        <Link className="text-sm font-semibold text-estate-700 hover:text-estate-800" href="/admin/properties">
          View all
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {properties.length > 0 ? (
          properties.map((property) => (
            <article
              className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
              key={property.id}
            >
              <div>
                <Link className="font-semibold text-slate-950 hover:text-estate-700" href={`/properties/${property.id}`}>
                  {property.title}
                </Link>
                <p className="mt-1 text-sm text-slate-600">
                  {property.city} · {formatPrice(property.price)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={property.moderationStatus} />
                <span className="text-sm text-slate-500">{formatDate(property.createdAt)}</span>
              </div>
            </article>
          ))
        ) : (
          <EmptyState>No recent properties found.</EmptyState>
        )}
      </div>
    </section>
  );
}

function RecentInquiries({ inquiries }: { inquiries: RecentAdminInquiry[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">Recent inquiries</h2>
        <Link
          className="text-sm font-semibold text-estate-700 hover:text-estate-800"
          href="/dashboard/inquiries"
        >
          View all
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <article
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              key={inquiry.id}
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <Link
                    className="font-semibold text-slate-950 hover:text-estate-700"
                    href={`/properties/${inquiry.propertyId}`}
                  >
                    {inquiry.propertyTitle}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    {inquiry.senderName} · {inquiry.senderEmail}
                  </p>
                </div>
                <span className="text-sm text-slate-500">{formatDate(inquiry.createdAt)}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{preview(inquiry.message)}</p>
            </article>
          ))
        ) : (
          <EmptyState>No recent inquiries found.</EmptyState>
        )}
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const overview = await getAdminOverview();
  const statCards = [
    { label: 'Users', value: overview.stats.totalUsers },
    { label: 'Properties', value: overview.stats.totalProperties },
    { label: 'Pending', value: overview.stats.pendingProperties },
    { label: 'Approved', value: overview.stats.approvedProperties },
    { label: 'Rejected', value: overview.stats.rejectedProperties },
    { label: 'Favorites', value: overview.stats.totalFavorites },
    { label: 'Inquiries', value: overview.stats.totalInquiries },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AdminNavigation active="dashboard" />

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">
            Admin overview
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Platform activity</h1>
              <p className="mt-2 text-slate-600">
                Signed in as {user.email}. Review the latest users, listings, and inquiries.
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-estate-800"
              href="/admin/properties"
            >
              Manage properties
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <RecentProperties properties={overview.recentProperties} />
          <RecentUsers users={overview.recentUsers} />
          <RecentInquiries inquiries={overview.recentInquiries} />
        </section>
      </div>
    </main>
  );
}
