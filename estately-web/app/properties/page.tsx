import { Metadata } from 'next';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyGrid } from '@/components/ui/property-grid';
import { Container } from '@/components/ui/container';
import { PropertyFilters } from '@/components/properties/property-filters';
import { PropertyPagination } from '@/components/properties/property-pagination';
import { PropertySortSelect } from '@/components/properties/property-sort-select';
import { PropertiesMapViewDynamic } from '@/components/properties/properties-map-view-dynamic';
import { PropertyViewToggle } from '@/components/properties/property-view-toggle';
import { SaveSearchButton } from '@/components/properties/save-search-button';
import { getCurrentUser } from '@/lib/auth';
import { getFavoritePropertyIds } from '@/lib/favorites/actions';
import { propertyImageUrl } from '@/lib/properties/image-url';
import { formatCurrencyEUR } from '@/lib/format/currency';
import { createSeoMetadata } from '@/lib/seo';
import {
  getPaginatedProperties,
  propertyDetailsHref,
  propertyResultsHref,
  parsePropertyPaginationParams,
  parsePropertySearchParams,
  parsePropertySortParam,
  type PropertySearchParams,
} from '@/lib/properties/search';

export const metadata: Metadata = {
  ...createSeoMetadata({
    title: 'Browse properties | Estately',
    description: 'Explore homes, apartments, villas and land listings available for sale and rent.',
    path: '/properties',
    keywords: ['browse properties', 'property search', 'real estate listings'],
  }),
};

interface PropertiesPageProps {
  searchParams?: Promise<PropertySearchParams>;
}

const fallbackCities = ['Sofia', 'Varna', 'Burgas', 'Plovdiv'];

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = parsePropertySearchParams(resolvedSearchParams);
  const pagination = parsePropertyPaginationParams(resolvedSearchParams);
  const sort = parsePropertySortParam(resolvedSearchParams);
  const view = firstParam(resolvedSearchParams.view) === 'map' ? 'map' : 'list';
  const user = await getCurrentUser();
  let paginatedProperties: Awaited<ReturnType<typeof getPaginatedProperties>>;

  try {
    paginatedProperties = await getPaginatedProperties(filters, pagination, sort);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return (
      <main className="flex-1 py-12 md:py-16">
        <Container>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-semibold text-charcoal-950">
                Unable to Load Properties
              </h2>
              <p className="text-stone-600">Something went wrong. Please try again later.</p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const formattedProperties = paginatedProperties.properties.map((prop) => ({
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
    latitude: prop.latitude ? Number(prop.latitude) : null,
    longitude: prop.longitude ? Number(prop.longitude) : null,
    listingType: (prop.listingType === 'rent' ? 'rent' : 'sale') as 'sale' | 'rent',
    createdAt: prop.createdAt,
    views: prop.views,
    isFeatured: prop.isFeatured,
  }));
  const favoritePropertyIds = user
    ? await getFavoritePropertyIds(
        user.id,
        formattedProperties.map((property) => property.id),
      )
    : new Set<number>();

  const isEmpty = formattedProperties.length === 0;
  const returnTo = propertyResultsHref('/properties', resolvedSearchParams);
  const startResult = isEmpty
    ? 0
    : (paginatedProperties.currentPage - 1) * paginatedProperties.pageSize + 1;
  const endResult = Math.min(
    paginatedProperties.currentPage * paginatedProperties.pageSize,
    paginatedProperties.totalCount,
  );

  return (
    <main className="flex-1 py-12 md:py-16">
      <Container>
        <div className="mb-12 flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-charcoal-950 md:text-5xl">
            Discover Your Dream Property
          </h1>
          <p className="max-w-2xl text-lg text-stone-600">
            Browse our curated collection of premium properties available for sale and rent across
            Bulgaria. Find the perfect place that matches your lifestyle.
          </p>
        </div>

        <PropertyFilters filters={filters} cities={fallbackCities} sort={sort} view={view} />

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {!isEmpty ? (
            <p className="text-sm font-medium text-stone-600">
              Showing {startResult}-{endResult} of {paginatedProperties.totalCount} propert
              {paginatedProperties.totalCount !== 1 ? 'ies' : 'y'}
            </p>
          ) : (
            <div aria-hidden="true" />
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end lg:ml-auto">
            <SaveSearchButton filters={filters} isAuthenticated={Boolean(user)} />
            <PropertyViewToggle searchParams={resolvedSearchParams} view={view} />
            <PropertySortSelect searchParams={resolvedSearchParams} value={sort} />
          </div>
        </div>

        {view === 'map' ? (
          <PropertiesMapViewDynamic properties={formattedProperties} />
        ) : (
          <PropertyGrid isEmpty={isEmpty}>
            {formattedProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                {...property}
                detailsHref={propertyDetailsHref(property.id, returnTo)}
                isAuthenticated={Boolean(user)}
                isFavorited={favoritePropertyIds.has(property.id)}
                imagePriority={index < 2}
                showFavoriteButton
              />
            ))}
          </PropertyGrid>
        )}

        {!isEmpty ? (
          <PropertyPagination
            currentPage={paginatedProperties.currentPage}
            totalPages={paginatedProperties.totalPages}
            hasPreviousPage={paginatedProperties.hasPreviousPage}
            hasNextPage={paginatedProperties.hasNextPage}
            searchParams={resolvedSearchParams}
          />
        ) : null}
      </Container>
    </main>
  );
}
