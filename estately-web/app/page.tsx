import Link from 'next/link';
import { getCurrentUser, logoutAction } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <Link className="text-xl font-semibold text-slate-950" href="/">
            Estately
          </Link>
          <div className="flex items-center gap-3 text-sm font-medium">
            {user ? (
              <>
                <Link className="text-slate-700 hover:text-emerald-700" href="/dashboard">
                  Dashboard
                </Link>
                <form action={logoutAction}>
                  <button className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 hover:border-emerald-700 hover:text-emerald-700">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link className="text-slate-700 hover:text-emerald-700" href="/login">
                  Login
                </Link>
                <Link className="rounded-md bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800" href="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Real estate, organized
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-slate-950">
              Find homes, save favorites, and manage your search securely.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Estately now has JWT authentication with httpOnly sessions, route protection, and
              admin-only access.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-md bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800" href={user ? '/dashboard' : '/register'}>
                {user ? 'Open dashboard' : 'Create account'}
              </Link>
              <Link className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:border-emerald-700 hover:text-emerald-700" href="/login">
                Sign in
              </Link>
            </div>
          </div>
          <div className="min-h-[420px] rounded-lg bg-[url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-xl" />
        </div>
      </section>
    </main>
  );
}
