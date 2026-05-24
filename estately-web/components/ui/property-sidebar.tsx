'use client';

import type { ReactNode } from 'react';

interface PropertySidebarProps {
  price: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  address: string;
  listingType?: 'sale' | 'rent';
  offerSlot?: ReactNode;
}

export function PropertySidebar({
  price,
  bedrooms,
  bathrooms,
  areaSqm,
  address,
  listingType = 'sale',
  offerSlot,
}: PropertySidebarProps) {
  return (
    <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
      {/* Price Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-estate-soft sm:p-6">
        <p className="text-sm text-stone-600 mb-2">Price</p>
        <p className="mb-1 break-words text-2xl font-bold text-estate-700 sm:text-3xl">
          {price}
          {listingType === 'rent' && (
            <span className="text-lg font-normal text-stone-600">/mo</span>
          )}
        </p>
        <p className="text-xs text-stone-500">
          {listingType === 'sale' ? 'Purchase price' : 'Monthly rent'}
        </p>
      </div>

      {/* Property Summary */}
      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-estate-soft sm:p-6">
        <h3 className="font-bold text-charcoal-950">Property Summary</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <span className="text-stone-600">Bedrooms</span>
            <span className="font-semibold text-charcoal-950">{bedrooms}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <span className="text-stone-600">Bathrooms</span>
            <span className="font-semibold text-charcoal-950">{bathrooms}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-600">Area</span>
            <span className="font-semibold text-charcoal-950">{areaSqm} m²</span>
          </div>
        </div>
      </div>

      {offerSlot}

      {/* Location Card */}
      <div className="rounded-2xl border border-stone-200 bg-cream-100 p-5 sm:p-6">
        <p className="text-sm text-stone-600 mb-2">Location</p>
        <p className="font-semibold text-charcoal-950 text-sm leading-relaxed">
          {address}
        </p>
      </div>
    </aside>
  );
}
