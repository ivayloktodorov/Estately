import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { LISTING_TYPES, PROPERTY_TYPES } from '@/lib/properties/constants';
import {
  getUserSavedSearches,
  savedSearchResultsHref,
  type SavedSearchListItem,
} from '@/lib/saved-searches/service';
import { deleteSavedSearchAction, updateSavedSearchAction } from '@/lib/saved-searches/actions';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(date);
}

function label(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function filterBadges(search: SavedSearchListItem): string[] {
  return [
    search.city,
    search.propertyType ? label(search.propertyType) : null,
    search.listingType ? (search.listingType === 'sale' ? 'For sale' : 'For rent') : null,
    search.minPrice !== undefined ? `From $${search.minPrice.toLocaleString()}` : null,
    search.maxPrice !== undefined ? `Up to $${search.maxPrice.toLocaleString()}` : null,
    search.bedrooms !== undefined ? `${search.bedrooms}+ beds` : null,
    search.bathrooms !== undefined ? `${search.bathrooms}+ baths` : null,
  ].filter((item): item is string => Boolean(item));
}

function EditSavedSearchForm({ search }: { search: SavedSearchListItem }) {
  return (
    <details className="mt-4 rounded-lg border border-stone-200 bg-slate-50 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-estate-700">Edit search</summary>
      <form action={updateSavedSearchAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input name="savedSearchId" type="hidden" value={search.id} />
        <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">
          Search name
          <input className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.title} name="title" required />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          City
          <input className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.city ?? ''} name="city" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Property type
          <select className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.propertyType ?? ''} name="type">
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {label(type)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Listing
          <select className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.listingType ?? ''} name="listing">
            <option value="">Sale or rent</option>
            {LISTING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'sale' ? 'For sale' : 'For rent'}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Min price
          <input className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.minPrice ?? ''} min="0" name="minPrice" type="number" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Max price
          <input className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.maxPrice ?? ''} min="0" name="maxPrice" type="number" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Bedrooms
          <input className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.bedrooms ?? ''} min="0" name="bedrooms" type="number" />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Bathrooms
          <input className="h-10 rounded-md border border-stone-300 px-3 font-normal" defaultValue={search.bathrooms ?? ''} min="0" name="bathrooms" type="number" />
        </label>
        <button className="h-10 rounded-md bg-estate-700 px-4 text-sm font-semibold text-white hover:bg-estate-800 sm:col-span-2">
          Save changes
        </button>
      </form>
    </details>
  );
}

export default async function SavedSearchesPage() {
  const user = await requireAuth();
  const searches = await getUserSavedSearches(user.id);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-estate-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-estate-700">Property alerts</p>
          <h1 className="mt-2 text-3xl font-semibold text-charcoal-950">Saved searches</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Manage searches and get notified when newly approved properties match your criteria.
          </p>
        </section>

        {searches.length === 0 ? (
          <section className="mt-6 rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center shadow-estate-soft">
            <h2 className="text-xl font-semibold text-charcoal-950">No saved searches yet.</h2>
            <Link className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white" href="/properties">
              Browse properties
            </Link>
          </section>
        ) : (
          <section className="mt-6 grid gap-4">
            {searches.map((search) => (
              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-estate-soft" key={search.id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal-950">{search.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">Created {formatDate(search.createdAt)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {filterBadges(search).length > 0 ? (
                        filterBadges(search).map((badge) => (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100" key={badge}>
                            {badge}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          All approved properties
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 px-3 text-sm font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700" href={savedSearchResultsHref(search)}>
                      View matches
                    </Link>
                    <form action={deleteSavedSearchAction}>
                      <input name="savedSearchId" type="hidden" value={search.id} />
                      <button className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
                <EditSavedSearchForm search={search} />
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
