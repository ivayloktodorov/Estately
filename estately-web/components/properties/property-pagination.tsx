import Link from 'next/link';
import type { PropertySearchParams } from '@/lib/properties/search';

interface PropertyPaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  searchParams: PropertySearchParams;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function pageHref(searchParams: PropertySearchParams, page: number): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === 'page') {
      return;
    }

    const paramValue = firstParam(value).trim();

    if (paramValue) {
      params.set(key, paramValue);
    }
  });

  if (page > 1) {
    params.set('page', page.toString());
  }

  const query = params.toString();
  return query ? `/properties?${query}` : '/properties';
}

function DisabledPaginationControl({ children }: { children: string }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex h-11 min-w-28 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 px-5 text-sm font-bold text-stone-400 shadow-sm"
    >
      {children}
    </span>
  );
}

export function PropertyPagination({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  searchParams,
}: PropertyPaginationProps) {
  return (
    <nav
      className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-estate-soft sm:flex-row"
      aria-label="Properties pagination"
    >
      {hasPreviousPage ? (
        <Link
          href={pageHref(searchParams, currentPage - 1)}
          className="inline-flex h-11 min-w-28 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-bold text-charcoal-950 shadow-sm transition hover:border-estate-700 hover:text-estate-700 focus:outline-none focus:ring-4 focus:ring-estate-700/10"
          aria-label={`Go to page ${currentPage - 1}`}
        >
          Previous
        </Link>
      ) : (
        <DisabledPaginationControl>Previous</DisabledPaginationControl>
      )}

      <p className="text-sm font-semibold text-stone-600" aria-live="polite">
        Page <span className="text-charcoal-950">{currentPage}</span> of{' '}
        <span className="text-charcoal-950">{totalPages}</span>
      </p>

      {hasNextPage ? (
        <Link
          href={pageHref(searchParams, currentPage + 1)}
          className="inline-flex h-11 min-w-28 items-center justify-center rounded-xl bg-estate-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-estate-800 focus:outline-none focus:ring-4 focus:ring-estate-700/20"
          aria-label={`Go to page ${currentPage + 1}`}
        >
          Next
        </Link>
      ) : (
        <DisabledPaginationControl>Next</DisabledPaginationControl>
      )}
    </nav>
  );
}
