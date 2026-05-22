import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="hidden flex-1 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop')] bg-cover bg-center lg:block" />
      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Estately
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Welcome back</h1>
            <p className="mt-3 text-slate-600">
              Sign in to manage saved homes, profile details, and dashboard access.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
