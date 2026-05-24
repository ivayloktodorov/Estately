'use client';

import { useState } from 'react';
import { createSavedSearchAction } from '@/lib/saved-searches/actions';
import type { PropertySearchFilters } from '@/lib/properties/search';
import { formatCurrencyEUR } from '@/lib/format/currency';

interface SaveSearchButtonProps {
  isAuthenticated: boolean;
  filters: PropertySearchFilters;
}

function defaultTitle(filters: PropertySearchFilters): string {
  const parts = [
    filters.city,
    filters.type ? `${filters.type}s` : 'properties',
    filters.maxPrice ? `under ${formatCurrencyEUR(filters.maxPrice)}` : '',
  ].filter(Boolean);

  return parts.join(' ') || 'My property search';
}

export function SaveSearchButton({ filters, isAuthenticated }: SaveSearchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <a
        className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-estate-300 hover:text-estate-700"
        href="/login"
      >
        Sign in to save search
      </a>
    );
  }

  return (
    <>
      <button
        className="inline-flex h-11 items-center justify-center rounded-lg border border-estate-200 bg-white px-5 text-sm font-semibold text-estate-700 shadow-sm transition hover:border-estate-300 hover:bg-estate-50"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Save current search
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <form
            action={async (formData) => {
              await createSavedSearchAction(formData);
              setIsOpen(false);
            }}
            className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-charcoal-950">Save search</h2>
                <p className="mt-1 text-sm text-slate-600">Name this search to receive matching property alerts.</p>
              </div>
              <button
                aria-label="Close save search modal"
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">
              Search name
              <input
                className="h-11 rounded-lg border border-stone-300 px-3 text-sm font-normal text-charcoal-950 outline-none focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10"
                defaultValue={defaultTitle(filters)}
                maxLength={120}
                name="title"
                required
              />
            </label>
            <input name="city" type="hidden" value={filters.city ?? ''} />
            <input name="type" type="hidden" value={filters.type ?? ''} />
            <input name="listing" type="hidden" value={filters.listing ?? ''} />
            <input name="minPrice" type="hidden" value={filters.minPrice ?? ''} />
            <input name="maxPrice" type="hidden" value={filters.maxPrice ?? ''} />
            <input name="bedrooms" type="hidden" value={filters.bedrooms ?? ''} />
            <input name="bathrooms" type="hidden" value={filters.bathrooms ?? ''} />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="h-11 rounded-lg border border-stone-200 px-5 text-sm font-semibold text-slate-700 hover:border-estate-300 hover:text-estate-700"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button className="h-11 rounded-lg bg-estate-700 px-5 text-sm font-semibold text-white hover:bg-estate-800">
                Save search
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
