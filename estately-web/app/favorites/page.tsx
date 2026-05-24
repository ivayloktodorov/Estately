import { requireAuth } from '@/lib/auth';
import { getFavoriteProperties } from '@/lib/favorites/queries';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyGrid } from '@/components/ui/property-grid';
import { ButtonLink } from '@/components/ui/button-link';
import { propertyImageUrl } from '@/lib/properties/image-url';
import { formatCurrencyEUR } from '@/lib/format/currency';
import { propertyDetailsHref } from '@/lib/properties/search';

export default async function FavoritesPage() {
  const user = await requireAuth();
  const favoriteProperties = await getFavoriteProperties(user.id);

  const formattedProperties = favoriteProperties.map((prop) => ({
    id: prop.id,
    title: prop.title,
    price: formatCurrencyEUR(prop.price),
    city: prop.city,
    address: prop.address,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    areaSqm: prop.areaSqm,
    propertyType: prop.propertyType,
    imageUrl: propertyImageUrl(prop.imageCoverUrl, prop.propertyType),
    listingType: (prop.listingType === 'rent' ? 'rent' : 'sale') as 'sale' | 'rent',
  }));

  const isEmpty = formattedProperties.length === 0;

  return (
    <main className="flex-1 bg-cream-50 py-12 md:py-16">
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-estate-700">
              Saved homes
            </p>
            <h1 className="mt-3 text-4xl font-bold text-charcoal-950 md:text-5xl">
              Your favorite properties
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-stone-600">
              Revisit the homes you saved while comparing neighborhoods, budgets, and next steps.
            </p>
          </div>
          <ButtonLink href="/properties" variant="secondary">
            Browse properties
          </ButtonLink>
        </div>

        {!isEmpty ? (
          <div className="mb-8 text-sm font-medium text-stone-600">
            Showing {formattedProperties.length} saved propert
            {formattedProperties.length !== 1 ? 'ies' : 'y'}
          </div>
        ) : null}

        <PropertyGrid
          isEmpty={isEmpty}
          emptyTitle="No favorite properties yet"
          emptyDescription="Save properties from the listings page and they will appear here."
        >
          {formattedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              detailsHref={propertyDetailsHref(property.id, '/favorites')}
              isAuthenticated
              isFavorited
              showFavoriteButton
            />
          ))}
        </PropertyGrid>
      </Container>
    </main>
  );
}
