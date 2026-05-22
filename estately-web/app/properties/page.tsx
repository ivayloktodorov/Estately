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
  try {
    // Fetch all published properties sorted by newest first
    const allProperties = await db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt));

    // Format properties for display
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
      // Determine listing type based on property type or create a separate field
      // For now, we'll use a simple heuristic
      listingType: (prop.propertyType.toLowerCase().includes('apartment') || prop.title.toLowerCase().includes('rent')
        ? 'rent'
        : 'sale') as 'sale' | 'rent',
    }));

    const isEmpty = formattedProperties.length === 0;

    return (
      <main className="flex-1 py-12 md:py-16">
        <Container>
          {/* Header */}
          <div className="mb-12 flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal-950">
              Discover Your Dream Property
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl">
              Browse our curated collection of premium properties available for sale and rent across Bulgaria.
              Find the perfect place that matches your lifestyle.
            </p>
          </div>

          {/* Property Count */}
          {!isEmpty && (
            <div className="mb-8 text-sm font-medium text-stone-600">
              Showing {formattedProperties.length} propert{formattedProperties.length !== 1 ? 'ies' : 'y'}
            </div>
          )}

          {/* Properties Grid */}
          <PropertyGrid isEmpty={isEmpty}>
            {formattedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                imageUrl={property.imageUrl}
                price={property.price}
                title={property.title}
                city={property.city}
                address={property.address}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                areaSqm={property.areaSqm}
                propertyType={property.propertyType}
                listingType={property.listingType}
              />
            ))}
          </PropertyGrid>
        </Container>
      </main>
    );
  } catch (error) {
    console.error('Error fetching properties:', error);
    return (
      <main className="flex-1 py-12 md:py-16">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-charcoal-950 mb-2">Unable to Load Properties</h2>
              <p className="text-stone-600">Something went wrong. Please try again later.</p>
            </div>
          </div>
        </Container>
      </main>
    );
  }
}
