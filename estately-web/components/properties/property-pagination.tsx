import Link from 'next/link';
import type { PropertySearchParams } from '@/lib/properties/search';

interface PropertyPaginationProps {
  basePath?: string;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  searchParams: PropertySearchParams;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function pageHref(basePath: string, searchParams: PropertySearchParams, page: number): string {
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
  return query ? `${basePath}?${query}` : basePath;
}

function hiddenSearchInputs(searchParams: PropertySearchParams) {
  return Object.entries(searchParams).flatMap(([key, value]) => {
    if (key === 'page') {
      return [];
    }

    const paramValue = firstParam(value).trim();

    return paramValue ? [<input key={key} name={key} type="hidden" value={paramValue} />] : [];
  });
}

function paginationItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const visiblePages = new Set<number>([1, totalPages]);
  const start = Math.max(1, currentPage - 3);
  const end = Math.min(totalPages, currentPage + 3);

  for (let page = start; page <= end; page += 1) {
    visiblePages.add(page);
  }

  if (currentPage <= 3) {
    for (let page = 1; page <= Math.min(6, totalPages); page += 1) {
      visiblePages.add(page);
    }
  }

  if (currentPage >= totalPages - 2) {
    for (let page = Math.max(1, totalPages - 5); page <= totalPages; page += 1) {
      visiblePages.add(page);
    }
  }

  const sortedPages = [...visiblePages].sort((a, b) => a - b);
  const items: (number | 'ellipsis')[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push('ellipsis');
    }

    items.push(page);
  });

  return items;
}

function DisabledPaginationControl({ children }: { children: string }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex h-10 min-w-24 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 px-4 text-sm font-bold text-stone-400 shadow-sm"
    >
      {children}
    </span>
  );
}

export function PaginationControls({
  basePath = '/properties',
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  searchParams,
}: PropertyPaginationProps) {
  const items = paginationItems(currentPage, totalPages);

  return (
    <nav
      className="mt-10 rounded-2xl border border-stone-200 bg-white p-4 shadow-estate-soft"
      aria-label="Properties pagination"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {hasPreviousPage ? (
            <Link
              href={pageHref(basePath, searchParams, currentPage - 1)}
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-lg border border-stone-200 bg-white px-4 text-sm font-bold text-charcoal-950 shadow-sm transition hover:border-estate-700 hover:text-estate-700 focus:outline-none focus:ring-4 focus:ring-estate-700/10"
              aria-label={`Go to page ${currentPage - 1}`}
            >
              Previous
            </Link>
          ) : (
            <DisabledPaginationControl>Previous</DisabledPaginationControl>
          )}

          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <span className="px-1 text-sm font-bold text-stone-400" key={`ellipsis-${index}`}>
                ...
              </span>
            ) : item === currentPage ? (
              <span
                aria-current="page"
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-estate-700 px-3 text-sm font-bold text-white shadow-sm"
                key={item}
              >
                {item}
              </span>
            ) : (
              <Link
                aria-label={`Go to page ${item}`}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-bold text-charcoal-950 shadow-sm transition hover:border-estate-700 hover:text-estate-700 focus:outline-none focus:ring-4 focus:ring-estate-700/10"
                href={pageHref(basePath, searchParams, item)}
                key={item}
              >
                {item}
              </Link>
            ),
          )}

          {hasNextPage ? (
            <Link
              href={pageHref(basePath, searchParams, currentPage + 1)}
              className="inline-flex h-10 min-w-24 items-center justify-center rounded-lg bg-estate-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-estate-800 focus:outline-none focus:ring-4 focus:ring-estate-700/20"
              aria-label={`Go to page ${currentPage + 1}`}
            >
              Next
            </Link>
          ) : (
            <DisabledPaginationControl>Next</DisabledPaginationControl>
          )}
        </div>

        <form action={basePath} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
          {hiddenSearchInputs(searchParams)}
          <label className="text-sm font-semibold text-stone-600" htmlFor="pagination-page">
            Go to page
          </label>
          <input
            className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm font-semibold text-charcoal-950 outline-none transition focus:border-estate-700 focus:ring-2 focus:ring-estate-700/10 sm:w-24"
            defaultValue={currentPage}
            id="pagination-page"
            inputMode="numeric"
            max={totalPages}
            min={1}
            name="page"
            type="number"
          />
          <button className="inline-flex h-10 items-center justify-center rounded-lg bg-estate-700 px-4 text-sm font-bold text-white transition hover:bg-estate-800">
            Go
          </button>
        </form>
      </div>
    </nav>
  );
}

export const PropertyPagination = PaginationControls;
