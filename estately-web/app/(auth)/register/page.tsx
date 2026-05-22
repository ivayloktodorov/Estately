import type { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create an Estately account to save and manage property searches.',
};

export default function RegisterPage() {
  return (
    <main className="bg-cream-50">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
        <div className="hidden min-h-[560px] rounded-lg bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-2xl shadow-charcoal-950/15 lg:block" />
        <div className="mx-auto w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-estate sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-estate-700">
            Start searching
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-charcoal-950">Create your account</h1>
          <p className="mt-3 text-stone-600">
            Save favorite listings, contact property owners, and personalize your search.
          </p>
          <div className="mt-8">
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
