import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { PropertyForm } from '@/components/property-form';

export const metadata = {
  title: 'Add Property - Estately',
  description: 'Create a new property listing on Estately',
};

export default async function AddPropertyPage() {
  // Protect this page - only authenticated users can access
  await requireAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            className="inline-flex items-center text-sm font-medium text-estate-700 hover:text-estate-800 transition mb-6"
            href="/dashboard"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold text-charcoal-950 mb-2">
            Add Property
          </h1>
          <p className="text-lg text-slate-600">
            Create a new property listing on Estately
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <PropertyForm />
        </div>
      </div>
    </main>
  );
}
