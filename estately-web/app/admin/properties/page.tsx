import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/auth';
import {
  getAdminProperties,
  type AdminPropertiesSearchParams,
  type AdminProperty,
  type ModerationStatus,
} from '@/lib/admin/properties';
import { formatCurrencyEUR } from '@/lib/format/currency';
import { getTranslations } from '@/lib/i18n';
import { propertyImageUrl } from '@/lib/properties/image-url';
import { bulkModeratePropertiesAction, deletePropertyAction, moderatePropertyAction } from './actions';
import { AdminNavigation } from '../admin-navigation';
import { DeletePropertyButton } from './delete-property-button';

interface AdminPropertiesPageProps {
  searchParams?: Promise<AdminPropertiesSearchParams>;
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
    approved: 'bg-estate-50 text-estate-700 ring-estate-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>
      {readableLabel(status)}
    </span>
  );
}

function TinyIcon({ children }: { children: string }) {
  return (
    <span aria-hidden="true" className="text-sm leading-none">
      {children}
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
  const disabled = property.moderationStatus === status;

  return (
    <form action={moderatePropertyAction}>
      <input name="propertyId" type="hidden" value={property.id} />
      <input name="status" type="hidden" value={status} />
      <button
        disabled={disabled}
        className={
          status === 'approved'
            ? 'inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-estate-800 px-3 text-xs font-semibold text-white transition hover:bg-estate-900 disabled:border disabled:border-slate-200 disabled:bg-white disabled:text-slate-400'
            : 'inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white'
        }
      >
        <TinyIcon>{status === 'approved' ? '○' : '×'}</TinyIcon>
        {status === 'approved' ? 'Approve' : 'Reject'}
      </button>
    </form>
  );
}

function PropertyActions({ property }: { property: AdminProperty }) {
  return (
    <div className="grid w-full gap-2 sm:w-40">
      <div className="grid grid-cols-2 gap-2">
        <Link
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700"
          href={`/properties/${property.id}`}
        >
          <TinyIcon>◉</TinyIcon>
          View
        </Link>
        <Link
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700"
          href={`/dashboard/properties/${property.id}/edit`}
        >
          <TinyIcon>✎</TinyIcon>
          Edit
        </Link>
      </div>
      <ModerationActionForm property={property} status="approved" />
      {property.moderationStatus === 'pending' ? (
        <ModerationActionForm property={property} status="rejected" />
      ) : (
        <form action={deletePropertyAction}>
          <input name="propertyId" type="hidden" value={property.id} />
          <DeletePropertyButton title={property.title} />
        </form>
      )}
    </div>
  );
}

function ModerationGuide() {
  const items = [
    { icon: '✓', title: 'Approve', copy: 'Listing becomes visible to the public.', tone: 'brand' },
    { icon: '×', title: 'Reject', copy: 'Listing is hidden and owner can edit and resubmit.', tone: 'red' },
    { icon: '⌫', title: 'Delete', copy: 'Listing is permanently removed.', tone: 'red' },
  ];

  return (
    <section className="mt-6 rounded-lg border border-estate-100 bg-estate-50/30 p-5 shadow-sm">
      <div className="flex items-center gap-3 text-sm font-semibold text-estate-900">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-estate-300 text-estate-700">
          i
        </span>
        Moderation guide
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div className="flex gap-3" key={item.title}>
            <span
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                item.tone === 'brand'
                  ? 'border-estate-300 text-estate-700'
                  : 'border-red-300 text-red-600'
              }`}
            >
              {item.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="mt-1 max-w-56 text-xs leading-5 text-slate-600">{item.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
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
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700"
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
          className="inline-flex h-10 min-w-24 items-center justify-center rounded-md bg-estate-700 px-4 text-sm font-semibold text-white hover:bg-estate-800"
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
  const t = await getTranslations();
  const result = await getAdminProperties((await searchParams) ?? {});

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AdminNavigation active="properties" />

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Listing moderation</p>
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
            <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 focus-within:border-estate-700 focus-within:ring-2 focus-within:ring-estate-700/10">
              <span aria-hidden="true" className="text-slate-500">
                ⌕
              </span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
                defaultValue={result.search}
                name="search"
                placeholder="Search by title, city, or owner"
                type="search"
              />
            </label>
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10" defaultValue={result.status} name="status">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10" defaultValue={result.listing} name="listing">
              <option value="">Sale and rent</option>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10" defaultValue={result.sort} name="sort">
              <option value="newest">{t.newestFirst}</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price low-high</option>
              <option value="price_desc">Price high-low</option>
              <option value="title">Title A-Z</option>
              <option value="city">City A-Z</option>
              <option value="status">Status</option>
            </select>
            <button className="h-11 rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white transition hover:bg-estate-800">Apply</button>
            <Link className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-estate-300 hover:text-estate-700" href="/admin/properties">
              {t.clear}
            </Link>
          </form>
        </section>

        {result.properties.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{t.noPropertiesFound}</h2>
          </section>
        ) : (
          <>
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <form action={bulkModeratePropertiesAction} className="flex flex-col gap-3 lg:flex-row lg:items-center" id="bulk-property-form">
                <select className="h-12 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10" name="bulkAction">
                  <option value="approve">Bulk actions</option>
                  <option value="approve">Approve selected</option>
                  <option value="reject">Reject selected</option>
                  <option value="delete">Delete selected</option>
                </select>
                <input className="h-12 flex-1 rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10" name="moderationNotes" placeholder="Add moderation notes (optional)" />
                <button className="h-12 rounded-md bg-estate-800/40 px-5 text-sm font-semibold text-white transition hover:bg-estate-800">
                  Apply to selected
                </button>
              </form>
            </section>

            <section className="mt-6 hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="w-16 px-4 py-3">
                        <input aria-label="Select all visible properties" className="h-4 w-4 rounded border-slate-300 text-estate-700" type="checkbox" />
                      </th>
                      <th className="w-[26%] px-4 py-3">Property</th>
                      <th className="w-[8%] px-4 py-3">{t.city}</th>
                      <th className="w-[8%] px-4 py-3">{t.type}</th>
                      <th className="w-[7%] px-4 py-3">Listing</th>
                      <th className="w-[8%] px-4 py-3">{t.price}</th>
                      <th className="w-[17%] px-4 py-3">Owner / User</th>
                      <th className="w-[9%] px-4 py-3">Created</th>
                      <th className="w-[9%] px-4 py-3">Status</th>
                      <th className="w-44 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.properties.map((property) => (
                      <tr className="align-middle" key={property.id}>
                        <td className="px-4 py-6">
                          <input aria-label={`Select ${property.title}`} className="h-4 w-4 rounded border-slate-300 text-estate-700" form="bulk-property-form" name="propertyIds" type="checkbox" value={property.id} />
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex min-w-0 gap-3">
                            <Image
                              alt=""
                              className="h-20 w-20 rounded-md object-cover"
                              height={80}
                              src={propertyImageUrl(property.imageCoverUrl, property.propertyType)}
                              width={80}
                            />
                            <div className="min-w-0">
                              <p className="font-mono text-xs text-slate-500">#{property.id}</p>
                              <p className="truncate font-semibold text-slate-950">{property.title}</p>
                              <p className="mt-1 text-xs text-slate-600">
                                {property.bedrooms} bed · {property.bathrooms} bath
                              </p>
                              <p className="mt-1 text-xs text-slate-600">
                                {property.areaSqm} m² · {property.imageCount} photo{property.imageCount === 1 ? '' : 's'}
                              </p>
                              {property.moderationNotes ? (
                                <p className="mt-1 truncate text-xs text-slate-500">{property.moderationNotes}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-6 text-slate-700">{property.city}</td>
                        <td className="px-4 py-6 text-slate-700">{readableLabel(property.propertyType)}</td>
                        <td className="px-4 py-6 text-slate-700">{readableLabel(property.listingType)}</td>
                        <td className="px-4 py-6 font-semibold text-slate-950">{formatCurrencyEUR(property.price)}</td>
                        <td className="px-4 py-6 text-slate-700">
                          {property.owner ? (
                            <>
                              <p className="truncate font-semibold text-slate-950">{property.owner.fullName}</p>
                              <p className="truncate text-xs text-slate-500">{property.owner.email}</p>
                            </>
                          ) : (
                            'Owner unavailable'
                          )}
                        </td>
                        <td className="px-4 py-6 text-slate-700">{formatDate(property.createdAt)}</td>
                        <td className="px-4 py-6">
                          <StatusBadge status={property.moderationStatus} />
                        </td>
                        <td className="px-4 py-6">
                          <PropertyActions property={property} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:hidden">
              {result.properties.map((property) => (
                <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={property.id}>
                  <div className="flex items-start gap-3">
                    <input
                      aria-label={`Select ${property.title}`}
                      className="mt-8 h-4 w-4 shrink-0 rounded border-slate-300 text-estate-700"
                      form="bulk-property-form"
                      name="propertyIds"
                      type="checkbox"
                      value={property.id}
                    />
                    <Image
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-md object-cover"
                      height={80}
                      src={propertyImageUrl(property.imageCoverUrl, property.propertyType)}
                      width={80}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-slate-500">#{property.id}</p>
                      <h2 className="truncate font-semibold text-slate-950">{property.title}</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{formatCurrencyEUR(property.price)}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {property.city} · {readableLabel(property.propertyType)} · {readableLabel(property.listingType)}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {property.imageCount} photo{property.imageCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Owner / User</dt>
                      <dd className="min-w-0 font-medium text-slate-900">
                        {property.owner ? (
                          <>
                            <span className="block truncate">{property.owner.fullName}</span>
                            <span className="block truncate text-xs font-normal text-slate-500">{property.owner.email}</span>
                          </>
                        ) : (
                          'Owner unavailable'
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Created</dt>
                      <dd className="font-medium text-slate-900">{formatDate(property.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Details</dt>
                      <dd className="font-medium text-slate-900">
                        {property.bedrooms} bed · {property.bathrooms} bath · {property.areaSqm} m²
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Status</dt>
                      <dd className="mt-1">
                        <StatusBadge status={property.moderationStatus} />
                      </dd>
                    </div>
                  </dl>

                  {property.moderationNotes ? (
                    <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">{property.moderationNotes}</p>
                  ) : null}

                  <div className="mt-5">
                    <PropertyActions property={property} />
                  </div>
                </article>
              ))}
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
        <ModerationGuide />
      </div>
    </main>
  );
}
