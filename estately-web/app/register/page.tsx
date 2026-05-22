import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Estately
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Create your account</h1>
            <p className="mt-3 text-slate-600">
              Save favorite listings, contact property owners, and personalize your search.
            </p>
          </div>
          <RegisterForm />
        </div>
      </section>
      <section className="hidden flex-1 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop')] bg-cover bg-center lg:block" />
    </main>
  );
}
