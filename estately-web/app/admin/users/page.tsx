import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/auth';
import { getAdminUsers, type AdminUserListItem, type AdminUsersSearchParams } from '@/lib/admin/users';
import { updateUserRoleAction } from './actions';

interface AdminUsersPageProps {
  searchParams?: Promise<AdminUsersSearchParams>;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
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

function UserAvatar({ user }: { user: AdminUserListItem }) {
  return user.avatarUrl ? (
    <Image alt="" className="h-10 w-10 rounded-full object-cover" height={40} src={user.avatarUrl} width={40} />
  ) : (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-sm font-bold text-estate-700">
      {initials(user.fullName)}
    </span>
  );
}

function RoleForm({ user }: { user: AdminUserListItem }) {
  return (
    <form action={updateUserRoleAction} className="flex flex-wrap gap-2">
      <input name="userId" type="hidden" value={user.id} />
      <select
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
        defaultValue={user.role}
        name="role"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button className="inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
        Save
      </button>
    </form>
  );
}

function usersHref(search: string, page: number, sort: string): string {
  const params = new URLSearchParams();

  if (search) {
    params.set('search', search);
  }

  if (page > 1) {
    params.set('page', page.toString());
  }

  if (sort !== 'newest') {
    params.set('sort', sort);
  }

  const query = params.toString();
  return query ? `/admin/users?${query}` : '/admin/users';
}

function Pagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  search,
  sort,
  totalPages,
}: {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  search: string;
  sort: string;
  totalPages: number;
}) {
  return (
    <nav
      aria-label="Users pagination"
      className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
    >
      {hasPreviousPage ? (
        <Link
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
          href={usersHref(search, currentPage - 1, sort)}
        >
          Previous
        </Link>
      ) : (
        <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
          Previous
        </span>
      )}
      <p className="text-sm font-semibold text-slate-600">
        Page <span className="text-slate-950">{currentPage}</span> of{' '}
        <span className="text-slate-950">{totalPages}</span>
      </p>
      {hasNextPage ? (
        <Link
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
          href={usersHref(search, currentPage + 1, sort)}
        >
          Next
        </Link>
      ) : (
        <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
          Next
        </span>
      )}
    </nav>
  );
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();
  const resolvedSearchParams = (await searchParams) ?? {};
  const result = await getAdminUsers(resolvedSearchParams);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-semibold text-slate-950" href="/admin">
            Estately Admin
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/admin/properties">
              Properties
            </Link>
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/admin/messages">
              Messages
            </Link>
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </nav>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            User management
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Users</h1>
              <p className="mt-2 text-slate-600">
                Search users, view account details, and manage platform roles.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {result.totalCount} total
            </span>
          </div>

          <form className="mt-6 flex flex-col gap-3 lg:flex-row" action="/admin/users">
            <label className="sr-only" htmlFor="user-search">
              Search users by name or email
            </label>
            <input
              className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
              defaultValue={result.search}
              id="user-search"
              name="search"
              placeholder="Search by name or email"
              type="search"
            />
            <select
              className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
              defaultValue={result.sort}
              name="sort"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A-Z</option>
              <option value="email">Email A-Z</option>
              <option value="role">Role</option>
            </select>
            <button className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Search
            </button>
            {result.search ? (
              <Link
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                href="/admin/users"
              >
                Clear
              </Link>
            ) : null}
          </form>
        </section>

        {result.users.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">No users found.</h2>
          </section>
        ) : (
          <>
            <section className="mt-6 hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created At</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.users.map((user) => (
                      <tr className="align-top" key={user.id}>
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">{user.id}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <span className="font-semibold text-slate-950">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{user.email}</td>
                        <td className="px-4 py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                              href={`/admin/users/${user.id}`}
                            >
                              Details
                            </Link>
                            <RoleForm user={user} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:hidden">
              {result.users.map((user) => (
                <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={user.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <p className="font-mono text-xs text-slate-500">#{user.id}</p>
                        <h2 className="font-semibold text-slate-950">{user.fullName}</h2>
                        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="mt-4">
                    <StatusBadge status={user.status} />
                  </div>
                  <p className="mt-4 text-sm text-slate-600">Created {formatDate(user.createdAt)}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                      href={`/admin/users/${user.id}`}
                    >
                      Details
                    </Link>
                    <RoleForm user={user} />
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {result.totalCount > result.pageSize ? (
          <Pagination
            currentPage={result.currentPage}
            hasNextPage={result.hasNextPage}
            hasPreviousPage={result.hasPreviousPage}
            search={result.search}
            sort={result.sort}
            totalPages={result.totalPages}
          />
        ) : null}
      </div>
    </main>
  );
}
