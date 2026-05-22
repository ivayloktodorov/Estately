import Link from 'next/link';
import { requireAuth } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link className="text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950">Profile</h1>
        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Name</dt>
            <dd className="mt-1 text-slate-950">{user.fullName}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-slate-950">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Role</dt>
            <dd className="mt-1 text-slate-950">{user.role}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
