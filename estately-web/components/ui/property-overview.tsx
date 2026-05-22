'use client';

interface PropertyOverviewProps {
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  propertyType: string;
  address: string;
  city: string;
}

export function PropertyOverview({
  bedrooms,
  bathrooms,
  areaSqm,
  propertyType,
  address,
  city,
}: PropertyOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Key Features Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-cream-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-estate-700">{bedrooms}</p>
          <p className="text-sm text-stone-600 mt-1">Bed{bedrooms !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-cream-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-estate-700">{bathrooms}</p>
          <p className="text-sm text-stone-600 mt-1">Bath{bathrooms !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-cream-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-estate-700">{areaSqm}</p>
          <p className="text-sm text-stone-600 mt-1">m²</p>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-4 border-t border-stone-200 pt-6">
        <div>
          <p className="text-sm text-stone-600 mb-1">Property Type</p>
          <p className="text-lg font-semibold text-charcoal-950">{propertyType}</p>
        </div>
        
        <div>
          <p className="text-sm text-stone-600 mb-1">Address</p>
          <p className="text-lg font-semibold text-charcoal-950">{address}</p>
        </div>

        <div>
          <p className="text-sm text-stone-600 mb-1">City</p>
          <p className="text-lg font-semibold text-charcoal-950">{city}</p>
        </div>
      </div>
    </div>
  );
}
