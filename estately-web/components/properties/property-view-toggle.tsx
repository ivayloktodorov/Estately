'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { PropertySearchParams } from '@/lib/properties/search';

type PropertiesView = 'list' | 'map';

interface PropertyViewToggleProps {
  searchParams: PropertySearchParams;
  view: PropertiesView;
}

const views: { label: string; value: PropertiesView }[] = [
  { label: 'List View', value: 'list' },
  { label: 'Map View', value: 'map' },
];

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export function PropertyViewToggle({ searchParams, view }: PropertyViewToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateView = (nextView: PropertiesView) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'view') {
        return;
      }

      const cleanValue = firstParam(value).trim();

      if (cleanValue) {
        params.set(key, cleanValue);
      }
    });

    if (nextView === 'map') {
      params.set('view', 'map');
    }

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  return (
    <div className="inline-flex w-full rounded-xl border border-stone-200 bg-white p-1 shadow-sm sm:w-auto">
      {views.map((item) => (
        <button
          aria-label={`Switch to ${item.label.toLowerCase()}`}
          aria-pressed={view === item.value}
          className={`h-10 flex-1 rounded-lg px-4 text-sm font-bold transition sm:flex-none ${
            view === item.value
              ? 'bg-estate-700 text-white shadow-sm'
              : 'text-charcoal-950 hover:bg-cream-50'
          } disabled:cursor-wait disabled:opacity-70`}
          disabled={isPending}
          key={item.value}
          onClick={() => updateView(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
