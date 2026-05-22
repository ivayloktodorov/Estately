import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Estately account.',
};

export default function LoginPage() {
  return (
    <main className="bg-cream-50">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-estate-700">
              Secure access
            </p>
            <h1 className="mt-3 text-4xl font-bold text-charcoal-950">Welcome back</h1>
            <p className="mt-4 text-base text-stone-600 leading-relaxed">
              Sign in to manage saved homes, profile details, and dashboard access.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-estate-soft">
            <LoginForm />
          </div>
        </div>
        <div className="hidden min-h-[560px] rounded-xl bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-xl shadow-charcoal-950/10 lg:block" />
      </section>
    </main>
  );
}
