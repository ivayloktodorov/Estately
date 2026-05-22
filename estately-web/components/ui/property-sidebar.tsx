'use client';

interface PropertySidebarProps {
  price: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  address: string;
  listingType?: 'sale' | 'rent';
}

export function PropertySidebar({
  price,
  bedrooms,
  bathrooms,
  areaSqm,
  address,
  listingType = 'sale',
}: PropertySidebarProps) {
  return (
    <div className="sticky top-24 space-y-6">
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

      {/* Contact CTA */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-estate-soft p-6 space-y-4">
        <button className="w-full bg-estate-700 hover:bg-estate-800 text-white font-semibold py-3 px-4 rounded-xl transition duration-300 shadow-lg hover:shadow-estate">
          Contact Agent
        </button>
        <p className="text-xs text-stone-500 text-center">
          Get more information about this property or schedule a viewing
        </p>
      </div>

      {/* Location Card */}
      <div className="bg-cream-100 rounded-2xl border border-stone-200 p-6">
        <p className="text-sm text-stone-600 mb-2">Location</p>
        <p className="font-semibold text-charcoal-950 text-sm leading-relaxed">
          {address}
        </p>
      </div>
    </div>
  );
}
