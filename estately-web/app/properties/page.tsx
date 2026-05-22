import { Metadata } from 'next';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyGrid } from '@/components/ui/property-grid';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Browse Properties',
  description:
    'Explore our collection of premium properties available for sale and rent. Find your dream home in Bulgaria with Estately.',
  openGraph: {
    title: 'Browse Properties | Estately',
    description:
      'Explore our collection of premium properties available for sale and rent. Find your dream home in Bulgaria with Estately.',
    type: 'website',
  },
};

export default async function PropertiesPage() {
  let allProperties: (typeof properties.$inferSelect)[] = [];

  try {
    allProperties = await db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt));
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

  const formattedProperties = allProperties.map((prop) => ({
    id: prop.id,
    title: prop.title,
    price: `$${Number(prop.price).toLocaleString()}`,
    city: prop.city,
    address: prop.address,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    areaSqm: prop.areaSqm,
    propertyType: prop.propertyType,
    imageUrl: prop.imageCoverUrl,
    listingType: (prop.listingType === 'rent' ? 'rent' : 'sale') as 'sale' | 'rent',
  }));

  const isEmpty = formattedProperties.length === 0;

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

        {!isEmpty ? (
          <div className="mb-8 text-sm font-medium text-stone-600">
            Showing {formattedProperties.length} propert
            {formattedProperties.length !== 1 ? 'ies' : 'y'}
          </div>
        ) : null}

        <PropertyGrid isEmpty={isEmpty}>
          {formattedProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </PropertyGrid>
      </Container>
    </main>
  );
}
