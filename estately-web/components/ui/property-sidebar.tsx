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
    <aside className="space-y-6 lg:sticky lg:top-24">
      {/* Price Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-estate-soft p-6">
        <p className="text-sm text-stone-600 mb-2">Price</p>
        <p className="text-3xl font-bold text-estate-700 mb-1">
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
      <div className="bg-white rounded-2xl border border-stone-200 shadow-estate-soft p-6 space-y-4">
        <h3 className="font-bold text-charcoal-950">Property Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <span className="text-stone-600">Bedrooms</span>
            <span className="font-semibold text-charcoal-950">{bedrooms}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <span className="text-stone-600">Bathrooms</span>
            <span className="font-semibold text-charcoal-950">{bathrooms}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-600">Area</span>
            <span className="font-semibold text-charcoal-950">{areaSqm} m²</span>
          </div>
        </div>
      </div>

      {offerSlot}

      {/* Location Card */}
      <div className="bg-cream-100 rounded-2xl border border-stone-200 p-6">
        <p className="text-sm text-stone-600 mb-2">Location</p>
        <p className="font-semibold text-charcoal-950 text-sm leading-relaxed">
          {address}
        </p>
      </div>
    </aside>
  );
}
