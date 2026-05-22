import Link from 'next/link';
import { requireAuth } from '@/lib/auth';

export default async function FavoritesPage() {
  await requireAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link className="text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950">Favorites</h1>
        <p className="mt-3 text-slate-600">
          This protected page is ready for saved property listings.
        </p>
      </div>
    </main>
  );
}
