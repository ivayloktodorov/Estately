import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyGrid } from '@/components/ui/property-grid';
import { SectionHeader } from '@/components/ui/section-header';
import { PropertyPagination } from '@/components/properties/property-pagination';
import { propertyImageUrl } from '@/lib/properties/images';
import {
  getPaginatedProperties,
  propertyDetailsHref,
  propertyResultsHref,
  parsePropertyPaginationParams,
  type PropertySearchParams,
} from '@/lib/properties/search';

export const metadata: Metadata = {
  title: 'Buy',
  description: 'Browse homes for sale on Estately.',
};

interface BuyPageProps {
  searchParams?: Promise<PropertySearchParams>;
}

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePropertyPaginationParams(resolvedSearchParams);
  const result = await getPaginatedProperties(
    { listing: 'sale' },
    { ...pagination, pageSize: Math.min(pagination.pageSize, 20) },
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
    listingType: 'sale' as const,
  }));
  const isEmpty = formattedProperties.length === 0;
  const returnTo = propertyResultsHref('/buy', resolvedSearchParams);

  return (
    <main className="bg-white py-20">
      <Container>
        <SectionHeader
          description="Browse published homes for sale from the Estately marketplace."
          title="Homes for sale"
        />
        <div className="mt-10">
          <PropertyGrid isEmpty={isEmpty} emptyTitle="No properties found." emptyDescription="Check back soon for new homes for sale.">
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
            basePath="/buy"
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
