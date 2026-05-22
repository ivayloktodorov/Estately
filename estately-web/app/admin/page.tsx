import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-medium text-emerald-300 hover:text-emerald-200" href="/dashboard">
          Back to dashboard
        </Link>
        <section className="mt-8 rounded-lg border border-white/10 bg-white/5 p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Admin access
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Platform controls</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Signed in as {user.email}. This page requires the admin role in both middleware and the
            server component.
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
              href="/admin/properties"
            >
              Manage properties
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
