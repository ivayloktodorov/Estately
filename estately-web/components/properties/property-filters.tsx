'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import { LISTING_TYPES, PROPERTY_TYPES } from '@/lib/properties/constants';
import type { PropertySearchFilters } from '@/lib/properties/search';
import { FilterSelect } from './filter-select';
import { PriceRangeInputs } from './price-range-inputs';
import { PropertySearchBar } from './property-search-bar';

interface PropertyFiltersProps {
  filters: PropertySearchFilters;
  cities: string[];
}

interface FilterFormState {
  search: string;
  city: string;
  type: string;
  listing: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function initialState(filters: PropertySearchFilters): FilterFormState {
  return {
    search: filters.search ?? '',
    city: filters.city ?? '',
    type: filters.type ?? '',
    listing: filters.listing ?? '',
    minPrice: filters.minPrice?.toString() ?? '',
    maxPrice: filters.maxPrice?.toString() ?? '',
    bedrooms: filters.bedrooms?.toString() ?? '',
    bathrooms: filters.bathrooms?.toString() ?? '',
  };
}

export function PropertyFilters({ filters, cities }: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [formState, setFormState] = useState<FilterFormState>(() => initialState(filters));

  const cityOptions = useMemo(
    () => cities.map((city) => ({ label: city, value: city })),
    [cities],
  );

  const propertyTypeOptions = PROPERTY_TYPES.map((type) => ({
    label: formatLabel(type),
    value: type,
  }));

  const listingTypeOptions = LISTING_TYPES.map((type) => ({
    label: type === 'sale' ? 'For sale' : 'For rent',
    value: type,
  }));

  const roomOptions = ['1', '2', '3', '4', '5'].map((value) => ({
    label: `${value}+`,
    value,
  }));

  const updateField = (name: string, value: string) => {
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const pushFilters = (nextState: FilterFormState) => {
    const params = new URLSearchParams();

    Object.entries(nextState).forEach(([key, value]) => {
      const trimmedValue = value.trim();

      if (trimmedValue) {
        params.set(key, trimmedValue);
      }
    });

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushFilters(formState);
    setIsMobileOpen(false);
  };

  const clearFilters = () => {
    const emptyState = initialState({});
    setFormState(emptyState);
    setIsMobileOpen(false);
    startTransition(() => {
      router.push(pathname);
    });
  };

  const controls = (
    <>
      <PropertySearchBar
        value={formState.search}
        onChange={(value) => updateField('search', value)}
      />
      <FilterSelect
        label="City"
        name="city"
        value={formState.city}
        placeholder="Any city"
        options={cityOptions}
        onChange={updateField}
      />
      <FilterSelect
        label="Type"
        name="type"
        value={formState.type}
        placeholder="Any type"
        options={propertyTypeOptions}
        onChange={updateField}
      />
      <FilterSelect
        label="Listing"
        name="listing"
        value={formState.listing}
        placeholder="Sale or rent"
        options={listingTypeOptions}
        onChange={updateField}
      />
      <PriceRangeInputs
        minPrice={formState.minPrice}
        maxPrice={formState.maxPrice}
        onChange={updateField}
      />
      <FilterSelect
        label="Beds"
        name="bedrooms"
        value={formState.bedrooms}
        placeholder="Any beds"
        options={roomOptions}
        onChange={updateField}
      />
      <FilterSelect
        label="Baths"
        name="bathrooms"
        value={formState.bathrooms}
        placeholder="Any baths"
        options={roomOptions}
        onChange={updateField}
      />
    </>
  );

  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-estate-soft md:p-5">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-950">Filters</h2>
          <p className="text-sm text-stone-600">Search and refine properties</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-charcoal-950 shadow-sm"
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? 'Close' : 'Open'}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`${isMobileOpen ? 'mt-5 grid' : 'hidden'} gap-4 md:grid md:grid-cols-2 md:items-end lg:grid-cols-[minmax(220px,1.35fr)_minmax(150px,.75fr)_minmax(150px,.75fr)_minmax(150px,.75fr)_minmax(280px,1fr)_minmax(120px,.6fr)_minmax(120px,.6fr)_auto]`}
      >
        {controls}
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-xl bg-estate-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-estate-800 disabled:cursor-wait disabled:opacity-70"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="h-12 rounded-xl border border-stone-200 bg-white px-5 text-sm font-bold text-charcoal-950 shadow-sm transition hover:border-estate-700 hover:text-estate-700 disabled:cursor-wait disabled:opacity-70"
          >
            Clear filters
          </button>
        </div>
      </form>
    </section>
  );
}
