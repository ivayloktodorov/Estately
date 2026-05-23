import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { PropertyImageUpload } from '@/components/properties/property-image-upload';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';
import { propertyImageUrl } from '@/lib/properties/images';

export default async function DashboardPage() {
  const user = await requireAuth();
  const manageableProperties =
    user.role === 'admin'
      ? await db.select().from(properties).orderBy(desc(properties.createdAt))
      : await db
          .select()
          .from(properties)
          .where(eq(properties.createdByUserId, user.id))
          .orderBy(desc(properties.createdAt));

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {user.role} dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Hi, {user.fullName}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Your authenticated session is active. This route is protected by middleware and server
            helpers.
          </p>
        </section>

        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-8 shadow-estate-soft">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">
                Listing photos
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal-950">
                Upload property images
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Add JPG, PNG, or WEBP photos up to 5MB. The first uploaded image becomes the cover.
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft hover:bg-estate-800"
              href="/dashboard/properties/new"
            >
              Add Property
            </Link>
          </div>

          <div className="mt-8 grid gap-5">
            {manageableProperties.length > 0 ? (
              manageableProperties.map((property) => (
                <article
                  className="grid gap-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[180px_1fr]"
                  key={property.id}
                >
                  <img
                    alt={property.title}
                    className="aspect-video w-full rounded-lg object-cover md:aspect-square"
                    src={propertyImageUrl(property.imageCoverUrl)}
                  />
                  <div>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal-950">{property.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {property.city} · {property.address}
                        </p>
                      </div>
                      <Link
                        className="text-sm font-semibold text-estate-700 hover:text-estate-800"
                        href={`/properties/${property.id}`}
                      >
                        View listing
                      </Link>
                    </div>
                    <PropertyImageUpload propertyId={property.id} />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-stone-300 bg-cream-50 p-8 text-center">
                <h3 className="text-xl font-semibold text-charcoal-950">No properties yet</h3>
                <p className="mt-2 text-slate-600">
                  Create a property first, then return here to upload listing photos.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
