import Link from 'next/link';
import { logoutAction, requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-semibold text-slate-950" href="/">
            Estately
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/dashboard/properties/new">
              Add Property
            </Link>
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/profile">
              Profile
            </Link>
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/favorites">
              Favorites
            </Link>
            {user.role === 'admin' ? (
              <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/admin">
                Admin
              </Link>
            ) : null}
            <form action={logoutAction}>
              <button className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:border-emerald-700 hover:text-emerald-700">
                Logout
              </button>
            </form>
          </div>
        </nav>
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {user.role} dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Hi, {user.fullName}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Your authenticated session is active. This route is protected by middleware and server
            helpers.
          </p>
        </section>
      </div>
    </main>
  );
}
