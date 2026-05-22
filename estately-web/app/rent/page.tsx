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
    imageUrl:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
    price: '$2,850/mo',
    title: 'Light-Filled Loft',
    location: 'Chicago, IL',
    meta: '2 beds / 2 baths / 1,180 sq ft',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop',
    price: '$3,400/mo',
    title: 'Downtown Apartment',
    location: 'Seattle, WA',
    meta: '2 beds / 2 baths / 1,320 sq ft',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&auto=format&fit=crop',
    price: '$4,100/mo',
    title: 'Quiet Brownstone Flat',
    location: 'Brooklyn, NY',
    meta: '3 beds / 2 baths / 1,540 sq ft',
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
            <PropertyCard key={property.title} {...property} />
          ))}
        </div>
      </Container>
    </main>
  );
}
