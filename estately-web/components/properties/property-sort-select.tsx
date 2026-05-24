'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useLanguage } from '@/components/i18n/language-provider';
import { PROPERTY_SORT_OPTIONS, type PropertySortValue } from '@/lib/properties/constants';
import type { PropertySearchParams } from '@/lib/properties/search';

interface PropertySortSelectProps {
  searchParams: PropertySearchParams;
  value: PropertySortValue;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export function PropertySortSelect({ searchParams, value }: PropertySortSelectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const updateSort = (sort: string) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, paramValue]) => {
      if (key === 'page' || key === 'sort') {
        return;
      }

      const cleanValue = firstParam(paramValue).trim();

      if (cleanValue) {
        params.set(key, cleanValue);
      }
    });

    if (sort !== 'newest') {
      params.set('sort', sort);
    }

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  return (
    <label className="flex w-full flex-col gap-2 text-sm font-semibold text-charcoal-950 sm:w-64">
      {t('newestFirst')}
      <select
        className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-charcoal-950 shadow-sm outline-none transition focus:border-estate-700 focus:ring-4 focus:ring-estate-700/10 disabled:cursor-wait disabled:opacity-70"
        disabled={isPending}
        onChange={(event) => updateSort(event.target.value)}
        value={value}
      >
        {PROPERTY_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value === 'newest' ? t('newestFirst') : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
