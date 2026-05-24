'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState, useTransition } from 'react';
import { useLanguage } from '@/components/i18n/language-provider';
import { LISTING_TYPES, PROPERTY_TYPES } from '@/lib/properties/constants';
import type { PropertySearchFilters } from '@/lib/properties/search';
import { FilterSelect } from './filter-select';
import { PriceRangeInputs } from './price-range-inputs';
import { PropertySearchBar } from './property-search-bar';

interface PropertyFiltersProps {
  filters: PropertySearchFilters;
  cities: string[];
  fixedListing?: 'sale' | 'rent';
  sort: string;
  view: string;
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

function initialState(filters: PropertySearchFilters, fixedListing?: 'sale' | 'rent'): FilterFormState {
  return {
    search: filters.search ?? '',
    city: filters.city ?? '',
    type: filters.type ?? '',
    listing: fixedListing ?? filters.listing ?? '',
    minPrice: filters.minPrice?.toString() ?? '',
    maxPrice: filters.maxPrice?.toString() ?? '',
    bedrooms: filters.bedrooms?.toString() ?? '',
    bathrooms: filters.bathrooms?.toString() ?? '',
  };
}

export function PropertyFilters({ filters, cities, fixedListing, sort, view }: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FilterFormState>(() => initialState(filters, fixedListing));
  const { t } = useLanguage();

  const cityOptions = useMemo(
    () => cities.map((city) => ({ label: city, value: city })),
    [cities],
  );

  const propertyTypeOptions = PROPERTY_TYPES.map((type) => ({
    label: formatLabel(type),
    value: type,
  }));

  const listingTypeOptions = LISTING_TYPES.map((type) => ({
    label: type === 'sale' ? t('forSale') : t('forRent'),
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
      if (fixedListing && key === 'listing') {
        return;
      }

      const trimmedValue = value.trim();

      if (trimmedValue) {
        params.set(key, trimmedValue);
      }
    });

    if (sort !== 'newest') {
      params.set('sort', sort);
    }

    if (view === 'map') {
      params.set('view', view);
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushFilters(formState);
  };

  const clearFilters = () => {
    const emptyState = initialState({}, fixedListing);
    setFormState(emptyState);
    startTransition(() => {
      router.push(pathname);
    });
  };

  const controls = (
    <>
      <PropertySearchBar
        className="md:col-span-2 lg:col-span-3 xl:col-span-3"
        value={formState.search}
        onChange={(value) => updateField('search', value)}
      />
      <FilterSelect
        className="lg:col-span-2 xl:col-span-1"
        label={t('city')}
        name="city"
        value={formState.city}
        placeholder="Any city"
        options={cityOptions}
        onChange={updateField}
      />
      <FilterSelect
        className="lg:col-span-2 xl:col-span-1"
        label={t('type')}
        name="type"
        value={formState.type}
        placeholder="Any type"
        options={propertyTypeOptions}
        onChange={updateField}
      />
      {fixedListing ? null : (
        <FilterSelect
          className="lg:col-span-2 xl:col-span-1"
          label={t('type')}
          name="listing"
          value={formState.listing}
          placeholder="Sale or rent"
          options={listingTypeOptions}
          onChange={updateField}
        />
      )}
      <PriceRangeInputs
        className="md:col-span-2 lg:col-span-4 xl:col-span-2"
        minPrice={formState.minPrice}
        maxPrice={formState.maxPrice}
        onChange={updateField}
      />
      <FilterSelect
        className="lg:col-span-1 xl:col-span-1"
        label={t('beds')}
        name="bedrooms"
        value={formState.bedrooms}
        placeholder="Any beds"
        options={roomOptions}
        onChange={updateField}
      />
      <FilterSelect
        className="lg:col-span-1 xl:col-span-1"
        label={t('baths')}
        name="bathrooms"
        value={formState.bathrooms}
        placeholder="Any baths"
        options={roomOptions}
        onChange={updateField}
      />
    </>
  );

  return (
    <section className="mb-8 rounded-lg border border-stone-200 bg-white p-4 shadow-estate-soft">
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 md:grid-cols-4 md:items-end lg:grid-cols-8 xl:grid-cols-11"
      >
        {controls}
        <div className="flex flex-col gap-3 sm:flex-row md:col-span-2 lg:col-span-2 xl:col-span-2 xl:self-end">
          <button
            type="submit"
            disabled={isPending}
            className="h-11 flex-1 whitespace-nowrap rounded-md bg-estate-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-estate-800 disabled:cursor-wait disabled:opacity-70"
          >
            {isPending ? t('searching') : t('search')}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="h-11 flex-1 whitespace-nowrap rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-charcoal-950 shadow-sm transition hover:border-estate-700 hover:text-estate-700 disabled:cursor-wait disabled:opacity-70"
          >
            {t('clear')}
          </button>
        </div>
      </form>
    </section>
  );
}
