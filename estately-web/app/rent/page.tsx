import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Rent',
  description: 'Browse rental homes and apartments on Estately.',
};

const rentals = [
  {
    id: 101,
    imageUrl:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
    price: '$2,850',
    title: 'Light-Filled Loft',
    city: 'Chicago',
    address: 'Chicago, IL',
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 1180,
    propertyType: 'loft',
    listingType: 'rent' as const,
  },
  {
    id: 102,
    imageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop',
    price: '$3,400',
    title: 'Downtown Apartment',
    city: 'Seattle',
    address: 'Seattle, WA',
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 1320,
    propertyType: 'apartment',
    listingType: 'rent' as const,
  },
  {
    id: 103,
    imageUrl:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&auto=format&fit=crop',
    price: '$4,100',
    title: 'Quiet Brownstone Flat',
    city: 'Brooklyn',
    address: 'Brooklyn, NY',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 1540,
    propertyType: 'apartment',
    listingType: 'rent' as const,
  },
];

export default function RentPage() {
  return (
    <main className="bg-white py-20">
      <Container>
        <SectionHeader
          description="Preview rentals with the same clean, comparison-friendly layout."
          eyebrow="Rent"
          title="Rentals ready to explore"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {rentals.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </Container>
    </main>
  );
}
