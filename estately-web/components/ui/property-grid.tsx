import { ReactNode } from 'react';

interface PropertyGridProps {
  children: ReactNode;
  isEmpty?: boolean;
}

export function PropertyGrid({ children, isEmpty }: PropertyGridProps) {
  if (isEmpty) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-4 shadow-estate-soft">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-3xl">
            ?
          </div>
          <h3 className="mb-2 text-2xl font-semibold text-charcoal-950">No properties found</h3>
          <p className="text-stone-600">Try changing your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
