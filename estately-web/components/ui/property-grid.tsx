import { ReactNode } from 'react';

interface PropertyGridProps {
  children: ReactNode;
  isEmpty?: boolean;
}

export function PropertyGrid({ children, isEmpty }: PropertyGridProps) {
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">🏠</div>
          <h3 className="text-2xl font-semibold text-charcoal-950 mb-2">No Properties Found</h3>
          <p className="text-stone-600">There are no properties available at the moment. Please check back soon!</p>
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
