import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getUserProperties, type DashboardProperty } from '@/lib/dashboard/properties';
import { deleteOwnPropertyAction } from './actions';
import { DeletePropertyButton } from './delete-property-button';

function formatPrice(price: string): string {
  return `$${Number(price).toLocaleString()}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function readableLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={
        isPublished
          ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200'
          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200'
      }
    >
      {isPublished ? 'Published' : 'Hidden / Draft'}
    </span>
  );
}

function PropertyActions({ property }: { property: DashboardProperty }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700"
        href={`/properties/${property.id}`}
      >
        View
      </Link>
      <Link
        className="inline-flex h-9 items-center justify-center rounded-md bg-charcoal-950 px-3 text-sm font-semibold text-white transition hover:bg-charcoal-800"
        href={`/dashboard/properties/${property.id}/edit`}
      >
        Edit
      </Link>
      <form action={deleteOwnPropertyAction}>
        <input name="propertyId" type="hidden" value={property.id} />
        <DeletePropertyButton title={property.title} />
      </form>
    </div>
  );
}

export default async function DashboardPropertiesPage() {
  const user = await requireAuth();
  const userProperties = await getUserProperties(user.id);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">
            Listing management
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-charcoal-950">My Properties</h1>
              <p className="mt-2 text-slate-600">
                Manage the properties you have added to Estately.
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800"
              href="/dashboard/properties/new"
            >
              Add Property
            </Link>
          </div>
        </section>

        {userProperties.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-charcoal-950">
              You have not added any properties yet.
            </h2>
            <Link
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white shadow-estate-soft transition hover:bg-estate-800"
              href="/dashboard/properties/new"
            >
              Add your first property
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-6 hidden overflow-hidden rounded-lg border border-stone-200 bg-white shadow-estate-soft lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                  <thead className="bg-cream-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Listing</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created At</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {userProperties.map((property) => (
                      <tr className="align-top" key={property.id}>
                        <td className="px-4 py-4 font-semibold text-charcoal-950">{property.title}</td>
                        <td className="px-4 py-4 text-slate-700">{property.city}</td>
                        <td className="px-4 py-4 font-semibold text-charcoal-950">{formatPrice(property.price)}</td>
                        <td className="px-4 py-4 text-slate-700">{readableLabel(property.propertyType)}</td>
                        <td className="px-4 py-4 text-slate-700">{readableLabel(property.listingType)}</td>
                        <td className="px-4 py-4">
                          <StatusBadge isPublished={property.isPublished} />
                        </td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(property.createdAt)}</td>
                        <td className="px-4 py-4">
                          <PropertyActions property={property} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:hidden">
              {userProperties.map((property) => (
                <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft" key={property.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal-950">{property.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {property.city} · {formatPrice(property.price)}
                      </p>
                    </div>
                    <StatusBadge isPublished={property.isPublished} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Type</dt>
                      <dd className="font-medium text-slate-900">{readableLabel(property.propertyType)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Listing</dt>
                      <dd className="font-medium text-slate-900">{readableLabel(property.listingType)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Created At</dt>
                      <dd className="font-medium text-slate-900">{formatDate(property.createdAt)}</dd>
                    </div>
                  </dl>
                  <div className="mt-5">
                    <PropertyActions property={property} />
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
