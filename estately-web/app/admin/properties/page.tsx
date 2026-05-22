import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { getAdminProperties, type AdminProperty } from '@/lib/admin/properties';
import { deletePropertyAction, togglePropertyPublishedAction } from './actions';
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
      {isPublished ? 'Published' : 'Draft / Hidden'}
    </span>
  );
}

function PropertyActions({ property }: { property: AdminProperty }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        href={`/properties/${property.id}`}
      >
        View
      </Link>
      <form action={togglePropertyPublishedAction}>
        <input name="propertyId" type="hidden" value={property.id} />
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
          {property.isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </form>
      <form action={deletePropertyAction}>
        <input name="propertyId" type="hidden" value={property.id} />
        <DeletePropertyButton title={property.title} />
      </form>
    </div>
  );
}

export default async function AdminPropertiesPage() {
  await requireAdmin();
  const adminProperties = await getAdminProperties();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-semibold text-slate-950" href="/admin">
            Estately Admin
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/dashboard">
              Dashboard
            </Link>
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/">
              Homepage
            </Link>
          </div>
        </nav>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Property moderation
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Properties</h1>
              <p className="mt-2 text-slate-600">
                Review listings, control publication status, and remove invalid properties.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {adminProperties.length} total
            </span>
          </div>
        </section>

        {adminProperties.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">No properties found.</h2>
          </section>
        ) : (
          <>
            <section className="mt-6 hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3">ID</th>
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
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {adminProperties.map((property) => (
                      <tr className="align-top" key={property.id}>
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">{property.id}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-950">{property.title}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {property.owner ? property.owner.email : 'Owner unavailable'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{property.city}</td>
                        <td className="px-4 py-4 font-semibold text-slate-950">{formatPrice(property.price)}</td>
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
              {adminProperties.map((property) => (
                <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={property.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-slate-500">#{property.id}</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-950">{property.title}</h2>
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
                    <div>
                      <dt className="text-slate-500">Owner</dt>
                      <dd className="font-medium text-slate-900">
                        {property.owner ? property.owner.fullName : 'Unavailable'}
                      </dd>
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
