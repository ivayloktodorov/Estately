import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyGrid } from '@/components/ui/property-grid';
import { SectionHeader } from '@/components/ui/section-header';
import { PropertyFilters } from '@/components/properties/property-filters';
import { PropertyPagination } from '@/components/properties/property-pagination';
import { PropertySortSelect } from '@/components/properties/property-sort-select';
import { propertyImageUrl } from '@/lib/properties/images';
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
    title: 'Homes and apartments for rent | Estately',
    description: 'Browse rental homes, apartments, villas, offices and land listings.',
    path: '/rent',
    keywords: ['homes for rent', 'apartments for rent', 'rental properties'],
  }),
};

interface RentPageProps {
  searchParams?: Promise<PropertySearchParams>;
}

export default async function RentPage({ searchParams }: RentPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePropertyPaginationParams(resolvedSearchParams);
  const filters = { ...parsePropertySearchParams(resolvedSearchParams), listing: 'rent' as const };
  const sort = parsePropertySortParam(resolvedSearchParams);
  const result = await getPaginatedProperties(
    filters,
    { ...pagination, pageSize: Math.min(pagination.pageSize, 20) },
    sort,
  );
  const formattedProperties = result.properties.map((property) => ({
    id: property.id,
    imageUrl: propertyImageUrl(property.imageCoverUrl, property.propertyType),
    price: `$${Number(property.price).toLocaleString()}`,
    title: property.title,
    city: property.city,
    address: property.address,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    propertyType: property.propertyType,
    listingType: 'rent' as const,
    createdAt: property.createdAt,
    views: property.views,
    isFeatured: property.isFeatured,
  }));
  const isEmpty = formattedProperties.length === 0;
  const hasActiveFilters = Object.entries(resolvedSearchParams).some(([key, value]) => {
    if (key === 'page' || key === 'pageSize') {
      return false;
    }

    return Array.isArray(value) ? value.some(Boolean) : Boolean(value);
  });
  const emptyDescription = hasActiveFilters
    ? 'Clear filters or widen your search to see more rentals.'
    : 'No rental properties are available yet.';
  const returnTo = propertyResultsHref('/rent', resolvedSearchParams);

  return (
    <main className="bg-white py-20">
      <Container>
        <SectionHeader
          description="Browse published rental properties from the Estately marketplace."
          title="Rentals ready to explore"
        />
        <div className="mt-8">
          <PropertyFilters
            cities={['Sofia', 'Varna', 'Burgas', 'Plovdiv']}
            filters={filters}
            fixedListing="rent"
            sort={sort}
            view="list"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <PropertySortSelect searchParams={resolvedSearchParams} value={sort} />
        </div>
        <div className="mt-8">
          <PropertyGrid isEmpty={isEmpty} emptyTitle="No properties found." emptyDescription={emptyDescription}>
            {formattedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                detailsHref={propertyDetailsHref(property.id, returnTo)}
              />
            ))}
          </PropertyGrid>
        </div>

        {!isEmpty ? (
          <PropertyPagination
            basePath="/rent"
            currentPage={result.currentPage}
            totalPages={result.totalPages}
            hasPreviousPage={result.hasPreviousPage}
            hasNextPage={result.hasNextPage}
            searchParams={resolvedSearchParams}
          />
        ) : null}
      </Container>
    </main>
  );
}
