import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyGrid } from '@/components/ui/property-grid';
import { SectionHeader } from '@/components/ui/section-header';
import { PropertyPagination } from '@/components/properties/property-pagination';
import { propertyImageUrl } from '@/lib/properties/images';
import {
  getPaginatedProperties,
  parsePropertyPaginationParams,
  type PropertySearchParams,
} from '@/lib/properties/search';

export const metadata: Metadata = {
  title: 'Rent',
  description: 'Browse rental homes and apartments on Estately.',
};

interface RentPageProps {
  searchParams?: Promise<PropertySearchParams>;
}

export default async function RentPage({ searchParams }: RentPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const pagination = parsePropertyPaginationParams(resolvedSearchParams);
  const result = await getPaginatedProperties(
    { listing: 'rent' },
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
    listingType: 'rent' as const,
  }));
  const isEmpty = formattedProperties.length === 0;

  return (
    <main className="bg-white py-20">
      <Container>
        <SectionHeader
          description="Browse published rental properties from the Estately marketplace."
          title="Rentals ready to explore"
        />
        <div className="mt-10">
          <PropertyGrid isEmpty={isEmpty} emptyTitle="No properties found." emptyDescription="Check back soon for new rentals.">
            {formattedProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
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
