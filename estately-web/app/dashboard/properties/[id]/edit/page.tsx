import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getUserPropertyById } from '@/lib/dashboard/properties';
import { EditPropertyForm } from '@/components/edit-property-form';

interface EditPropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Edit Property - Estately',
  description: 'Update your Estately property listing',
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const user = await requireAuth();
  const { id } = await params;
  const propertyId = Number(id);

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    notFound();
  }

  const property = await getUserPropertyById(propertyId, user.id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <Link
            className="mb-6 inline-flex items-center text-sm font-medium text-estate-700 transition hover:text-estate-800"
            href="/dashboard/properties"
          >
            Back to My Properties
          </Link>
          <h1 className="mb-2 text-4xl font-semibold text-charcoal-950">Edit Property</h1>
          <p className="text-lg text-slate-600">Update listing details for {property.title}.</p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <EditPropertyForm property={property} />
        </div>
      </div>
    </main>
  );
}
