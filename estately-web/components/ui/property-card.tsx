import Link from 'next/link';
import Image from 'next/image';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { getTranslations } from '@/lib/i18n';
import { propertyImageUrl } from '@/lib/properties/image-url';

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
  detailsHref?: string;
  isFavorited?: boolean;
  isAuthenticated?: boolean;
  showFavoriteButton?: boolean;
  imagePriority?: boolean;
  createdAt?: Date;
  views?: number;
  isFeatured?: boolean;
}

const NEW_LISTING_DAYS = 7;
const HOT_VIEW_THRESHOLD = 100;

function propertyBadges(createdAt?: Date, views = 0, isFeatured = false): string[] {
  const badges: string[] = [];

  if (isFeatured) {
    badges.push('FEATURED');
  }

  if (createdAt) {
    const createdDate = new Date(createdAt);
    const ageMs = Date.now() - createdDate.getTime();
    const newListingMs = NEW_LISTING_DAYS * 24 * 60 * 60 * 1000;

    if (ageMs >= 0 && ageMs <= newListingMs) {
      badges.push('NEW');
    }
  }

  if (views >= HOT_VIEW_THRESHOLD) {
    badges.push('HOT');
  }

  return badges;
}

export async function PropertyCard({
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
  detailsHref,
  isFavorited = false,
  isAuthenticated = false,
  showFavoriteButton = false,
  imagePriority = false,
  createdAt,
  views = 0,
  isFeatured = false,
}: PropertyCardProps) {
  const coverImageUrl = propertyImageUrl(imageUrl, propertyType);
  const propertyHref = detailsHref ?? `/property/${id}`;
  const badges = propertyBadges(createdAt, views, isFeatured);
  const t = await getTranslations();

  return (
    <article className="group h-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-estate-soft transition duration-300 hover:-translate-y-2 hover:shadow-estate">
      <Link className="block h-full" href={propertyHref}>
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
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            loading={imagePriority ? 'eager' : 'lazy'}
            priority={imagePriority}
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          />
          {/* Badge */}
          <div className="absolute top-3 right-3 bg-estate-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {listingType === 'sale' ? t.forSale : t.forRent}
          </div>
          {badges.length > 0 ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {badges.slice(0, 2).map((badge) => (
                <span
                  className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-estate-800 shadow-sm"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
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
              <p className="text-xs text-stone-600">{t.beds}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-charcoal-950">{bathrooms}</p>
              <p className="text-xs text-stone-600">{t.baths}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-charcoal-950">{areaSqm}</p>
              <p className="text-xs text-stone-600">m²</p>
            </div>
          </div>

          <span className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-estate-700 px-4 text-sm font-bold text-white transition group-hover:bg-estate-800">
            {t.viewDetails}
          </span>
        </div>
      </Link>
    </article>
  );
}
