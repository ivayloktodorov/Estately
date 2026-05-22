import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Estately account.',
};

export default function LoginPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Secure access
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Welcome back</h1>
          <p className="mt-3 text-slate-600">
            Sign in to manage saved homes, profile details, and dashboard access.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
        <div className="hidden min-h-[560px] rounded-lg bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-2xl shadow-slate-900/15 lg:block" />
      </section>
    </main>
  );
}
