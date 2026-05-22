'use client';

interface PropertyDetailsSectionProps {
  title: string;
  price: string;
  description: string;
  listingType?: 'sale' | 'rent';
}

export function PropertyDetailsSection({
  title,
  price,
  description,
  listingType = 'sale',
}: PropertyDetailsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal-950 mb-3">
              {title}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-3xl md:text-4xl font-bold text-estate-700">
                {price}
                {listingType === 'rent' && (
                  <span className="text-lg font-normal text-stone-600">/month</span>
                )}
              </p>
              <div className="bg-estate-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-charcoal-950">About this property</h2>
        <div className="prose prose-stone max-w-none">
          <p className="text-lg text-stone-700 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
