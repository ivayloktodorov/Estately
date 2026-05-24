import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyGrid } from '@/components/ui/property-grid';
import { SectionHeader } from '@/components/ui/section-header';
import { PropertyFilters } from '@/components/properties/property-filters';
import { PropertyPagination } from '@/components/properties/property-pagination';
import { PropertySortSelect } from '@/components/properties/property-sort-select';
import { propertyImageUrl } from '@/lib/properties/image-url';
import { formatCurrencyEUR } from '@/lib/format/currency';
import { getTranslations } from '@/lib/i18n';
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
    title: 'Homes for sale | Estately',
    description: 'Browse homes, apartments, villas and land listings for sale.',
    path: '/sale',
    keywords: ['homes for sale', 'apartments for sale', 'villas for sale', 'land for sale'],
  }),
};

interface SalePageProps {
  searchParams?: Promise<PropertySearchParams>;
}

export default async function SalePage({ searchParams }: SalePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const t = await getTranslations();
  const pagination = parsePropertyPaginationParams(resolvedSearchParams);
  const filters = { ...parsePropertySearchParams(resolvedSearchParams), listing: 'sale' as const };
  const sort = parsePropertySortParam(resolvedSearchParams);
  const result = await getPaginatedProperties(
    filters,
    { ...pagination, pageSize: Math.min(pagination.pageSize, 20) },
    sort,
  );
  const formattedProperties = result.properties.map((property) => ({
    id: property.id,
    imageUrl: propertyImageUrl(property.imageCoverUrl, property.propertyType),
    price: formatCurrencyEUR(property.price),
    title: property.title,
    city: property.city,
    address: property.address,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    propertyType: property.propertyType,
    listingType: 'sale' as const,
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
    ? t.clearFiltersMoreSale
    : t.noSaleAvailable;
  const returnTo = propertyResultsHref('/sale', resolvedSearchParams);

  return (
    <main className="bg-white py-20">
      <Container>
        <SectionHeader
          description="Browse published homes for sale from the Estately marketplace."
          title={t.homesForSale}
        />
        <div className="mt-8">
          <PropertyFilters
            cities={['Sofia', 'Varna', 'Burgas', 'Plovdiv']}
            filters={filters}
            fixedListing="sale"
            sort={sort}
            view="list"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <PropertySortSelect searchParams={resolvedSearchParams} value={sort} />
        </div>
        <div className="mt-8">
          <PropertyGrid isEmpty={isEmpty} emptyTitle={t.noPropertiesFound} emptyDescription={emptyDescription}>
            {formattedProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                {...property}
                detailsHref={propertyDetailsHref(property.id, returnTo)}
                imagePriority={index < 2}
              />
            ))}
          </PropertyGrid>
        </div>

        {!isEmpty ? (
          <PropertyPagination
            basePath="/sale"
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
