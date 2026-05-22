import Link from 'next/link';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { propertyImageUrl } from '@/lib/properties/images';

interface PropertyCardProps {
  id: number;
  imageUrl: string;
  price: string;
  title: string;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  propertyType: string;
  listingType: 'sale' | 'rent';
  isFavorited?: boolean;
  isAuthenticated?: boolean;
  showFavoriteButton?: boolean;
}

export function PropertyCard({
  id,
  imageUrl,
  price,
  title,
  city,
  address,
  bedrooms,
  bathrooms,
  areaSqm,
  propertyType,
  listingType,
  isFavorited = false,
  isAuthenticated = false,
  showFavoriteButton = false,
}: PropertyCardProps) {
  const coverImageUrl = propertyImageUrl(imageUrl);

  return (
    <article className="group h-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-estate-soft transition duration-300 hover:-translate-y-2 hover:shadow-estate">
      <Link className="block h-full" href={`/properties/${id}`}>
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-stone-200">
          {showFavoriteButton ? (
            <FavoriteButton
              propertyId={id}
              initialIsFavorited={isFavorited}
              isAuthenticated={isAuthenticated}
              propertyTitle={title}
            />
          ) : null}
          <img
            src={coverImageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          />
          {/* Badge */}
          <div className="absolute top-3 right-3 bg-estate-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {listingType === 'sale' ? 'For Sale' : 'For Rent'}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col h-full">
          {/* Price */}
          <p className="text-2xl font-bold text-estate-700">
            {price}
            {listingType === 'rent' && <span className="text-sm font-normal text-stone-600">/mo</span>}
          </p>

          {/* Title */}
          <h3 className="mt-3 text-lg font-semibold text-charcoal-950 line-clamp-2 group-hover:text-estate-700 transition">
            {title}
          </h3>

          {/* Location */}
          <p className="mt-1 text-sm text-stone-600">{city}</p>
          <p className="text-sm text-stone-500 line-clamp-1">{address}</p>

          {/* Property Type */}
          <p className="mt-2 inline-block text-xs font-medium text-estate-700 bg-cream-100 px-2 py-1 rounded">
            {propertyType}
          </p>

          {/* Features Divider */}
          <div className="mt-4 pt-4 border-t border-stone-100" />

          {/* Features Grid */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-charcoal-950">{bedrooms}</p>
              <p className="text-xs text-stone-600">Bed{bedrooms !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-charcoal-950">{bathrooms}</p>
              <p className="text-xs text-stone-600">Bath{bathrooms !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-charcoal-950">{areaSqm}</p>
              <p className="text-xs text-stone-600">m²</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
