import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import {
  getAdminProperties,
  type AdminPropertiesSearchParams,
  type AdminProperty,
  type ModerationStatus,
} from '@/lib/admin/properties';
import { propertyImageUrl } from '@/lib/properties/images';
import { bulkModeratePropertiesAction, deletePropertyAction, moderatePropertyAction } from './actions';
import { DeletePropertyButton } from './delete-property-button';

/* eslint-disable @next/next/no-img-element */

interface AdminPropertiesPageProps {
  searchParams?: Promise<AdminPropertiesSearchParams>;
}

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

function StatusBadge({ status }: { status: ModerationStatus }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>
      {readableLabel(status)}
    </span>
  );
}

function propertiesHref(
  search: string,
  status: string,
  listing: string,
  sort: string,
  page: number,
): string {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (listing) params.set('listing', listing);
  if (sort !== 'newest') params.set('sort', sort);
  if (page > 1) params.set('page', page.toString());

  const query = params.toString();
  return query ? `/admin/properties?${query}` : '/admin/properties';
}

function ModerationActionForm({ property, status }: { property: AdminProperty; status: ModerationStatus }) {
  return (
    <form action={moderatePropertyAction}>
      <input name="propertyId" type="hidden" value={property.id} />
      <input name="status" type="hidden" value={status} />
      <button
        className={
          status === 'approved'
            ? 'inline-flex h-8 items-center justify-center rounded-md bg-emerald-700 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800'
            : 'inline-flex h-8 items-center justify-center rounded-md bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700'
        }
      >
        {status === 'approved' ? 'Approve' : 'Reject'}
      </button>
    </form>
  );
}

function PropertyActions({ property }: { property: AdminProperty }) {
  return (
    <div className="grid w-56 gap-2">
      <div className="flex flex-wrap gap-2">
        <Link
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          href={`/properties/${property.id}`}
        >
          View
        </Link>
        <Link
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          href={`/dashboard/properties/${property.id}/edit`}
        >
          Edit
        </Link>
        <ModerationActionForm property={property} status="approved" />
        <ModerationActionForm property={property} status="rejected" />
        <form action={deletePropertyAction}>
          <input name="propertyId" type="hidden" value={property.id} />
          <DeletePropertyButton title={property.title} />
        </form>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  listing,
  search,
  sort,
  status,
  totalPages,
}: {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  listing: string;
  search: string;
  sort: string;
  status: string;
  totalPages: number;
}) {
  return (
    <nav className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
      {hasPreviousPage ? (
        <Link
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
          href={propertiesHref(search, status, listing, sort, currentPage - 1)}
        >
          Previous
        </Link>
      ) : (
        <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
          Previous
        </span>
      )}
      <p className="text-sm font-semibold text-slate-600">
        Page <span className="text-slate-950">{currentPage}</span> of{' '}
        <span className="text-slate-950">{totalPages}</span>
      </p>
      {hasNextPage ? (
        <Link
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
          href={propertiesHref(search, status, listing, sort, currentPage + 1)}
        >
          Next
        </Link>
      ) : (
        <span className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400">
          Next
        </span>
      )}
    </nav>
  );
}

export default async function AdminPropertiesPage({ searchParams }: AdminPropertiesPageProps) {
  await requireAdmin();
  const result = await getAdminProperties((await searchParams) ?? {});

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-semibold text-slate-950" href="/admin">
            Estately Admin
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/admin/users">
              Users
            </Link>
            <Link className="font-medium text-slate-700 hover:text-emerald-700" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </nav>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Listing moderation</p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Properties</h1>
              <p className="mt-2 text-slate-600">
                Review submissions, approve public listings, reject invalid entries, and manage owner content.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {result.totalCount} total
            </span>
          </div>

          <form action="/admin/properties" className="mt-6 grid gap-3 lg:grid-cols-[1fr_repeat(3,180px)_auto_auto]">
            <input
              className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
              defaultValue={result.search}
              name="search"
              placeholder="Search by title, city, or owner"
              type="search"
            />
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" defaultValue={result.status} name="status">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" defaultValue={result.listing} name="listing">
              <option value="">Sale and rent</option>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" defaultValue={result.sort} name="sort">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price low-high</option>
              <option value="price_desc">Price high-low</option>
              <option value="title">Title A-Z</option>
              <option value="city">City A-Z</option>
              <option value="status">Status</option>
            </select>
            <button className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">Apply</button>
            <Link className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700" href="/admin/properties">
              Clear
            </Link>
          </form>
        </section>

        {result.properties.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">No properties found.</h2>
          </section>
        ) : (
          <>
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <form action={bulkModeratePropertiesAction} className="flex flex-col gap-3 lg:flex-row lg:items-center" id="bulk-property-form">
                <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" name="bulkAction">
                  <option value="approve">Approve selected</option>
                  <option value="reject">Reject selected</option>
                  <option value="delete">Delete selected</option>
                </select>
                <input className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" name="moderationNotes" placeholder="Bulk moderation notes, optional" />
                <button className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  Apply bulk action
                </button>
              </form>
            </section>

            <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="w-20 px-4 py-3">Select</th>
                      <th className="w-[24%] px-4 py-3">Property</th>
                      <th className="w-[8%] px-4 py-3">City</th>
                      <th className="w-[8%] px-4 py-3">Type</th>
                      <th className="w-[7%] px-4 py-3">Listing</th>
                      <th className="w-[8%] px-4 py-3">Price</th>
                      <th className="w-[18%] px-4 py-3">Owner/User</th>
                      <th className="w-[9%] px-4 py-3">Created</th>
                      <th className="w-[9%] px-4 py-3">Status</th>
                      <th className="w-60 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.properties.map((property) => (
                      <tr className="align-top" key={property.id}>
                        <td className="px-4 py-4">
                          <input aria-label={`Select ${property.title}`} className="h-4 w-4 rounded border-slate-300 text-emerald-700" form="bulk-property-form" name="propertyIds" type="checkbox" value={property.id} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex min-w-0 gap-3">
                            <img alt="" className="h-14 w-20 rounded-md object-cover" src={propertyImageUrl(property.imageCoverUrl)} />
                            <div className="min-w-0">
                              <p className="font-mono text-xs text-slate-500">#{property.id}</p>
                              <p className="truncate font-semibold text-slate-950">{property.title}</p>
                              {property.moderationNotes ? (
                                <p className="mt-1 truncate text-xs text-slate-500">{property.moderationNotes}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{property.city}</td>
                        <td className="px-4 py-4 text-slate-700">{readableLabel(property.propertyType)}</td>
                        <td className="px-4 py-4 text-slate-700">{readableLabel(property.listingType)}</td>
                        <td className="px-4 py-4 font-semibold text-slate-950">{formatPrice(property.price)}</td>
                        <td className="px-4 py-4 text-slate-700">
                          {property.owner ? (
                            <>
                              <p className="truncate font-semibold text-slate-950">{property.owner.fullName}</p>
                              <p className="truncate text-xs text-slate-500">{property.owner.email}</p>
                            </>
                          ) : (
                            'Owner unavailable'
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(property.createdAt)}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={property.moderationStatus} />
                        </td>
                        <td className="px-4 py-4">
                          <PropertyActions property={property} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {result.totalCount > result.pageSize ? (
          <Pagination
            currentPage={result.currentPage}
            hasNextPage={result.hasNextPage}
            hasPreviousPage={result.hasPreviousPage}
            listing={result.listing}
            search={result.search}
            sort={result.sort}
            status={result.status}
            totalPages={result.totalPages}
          />
        ) : null}
      </div>
    </main>
  );
}
