import type { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create an Estately account to save and manage property searches.',
};

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const redirectTo = firstParam(params.redirect) || firstParam(params.next);

  return (
    <main className="bg-cream-50">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="hidden min-h-[560px] rounded-xl bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-xl shadow-charcoal-950/10 lg:block" />
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-estate-700">
              Start searching
            </p>
            <h1 className="mt-3 text-4xl font-bold text-charcoal-950">Create your account</h1>
            <p className="mt-4 text-base text-stone-600 leading-relaxed">
              Save favorite listings, contact property owners, and personalize your search.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-estate-soft">
            <RegisterForm redirectTo={redirectTo} />
          </div>
        </div>
      </section>
    </main>
  );
}
