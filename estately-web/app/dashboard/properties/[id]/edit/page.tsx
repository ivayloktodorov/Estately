import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { getUserPropertyById } from '@/lib/dashboard/properties';
import { EditPropertyForm } from '@/components/edit-property-form';
import { PropertyImageUpload } from '@/components/properties/property-image-upload';
import { db } from '@/src/db/client';
import { propertyImages } from '@/src/db/schema';

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

  const property = await getUserPropertyById(propertyId, user.id, {
    includeAllForAdmin: user.role === 'admin',
  });

  if (!property) {
    notFound();
  }

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, property.id))
    .orderBy(desc(propertyImages.isCover), asc(propertyImages.sortOrder), asc(propertyImages.id));
  const initialImages = images.map((image) => ({
    ...image,
    createdAt: image.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <Link
            className="mb-6 inline-flex items-center text-sm font-medium text-estate-700 transition hover:text-estate-800"
            href={user.role === 'admin' ? '/admin/properties' : '/dashboard/properties'}
          >
            Back to {user.role === 'admin' ? 'moderation' : 'My Properties'}
          </Link>
          <h1 className="mb-2 text-4xl font-semibold text-charcoal-950">Edit Property</h1>
          <p className="text-lg text-slate-600">Update listing details for {property.title}.</p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <EditPropertyForm property={property} />
        </div>

        <div className="mt-8 rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <PropertyImageUpload initialImages={initialImages} propertyId={property.id} />
        </div>
      </div>
    </main>
  );
}
