import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Buy',
  description: 'Browse homes for sale on Estately.',
};

const homesForSale = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop',
    price: '$735,000',
    title: 'Garden District Home',
    city: 'Portland',
    address: 'Portland, OR',
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 2860,
    propertyType: 'house',
    listingType: 'sale' as const,
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=900&auto=format&fit=crop',
    price: '$980,000',
    title: 'Contemporary Courtyard House',
    city: 'Denver',
    address: 'Denver, CO',
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 3740,
    propertyType: 'house',
    listingType: 'sale' as const,
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&auto=format&fit=crop',
    price: '$549,000',
    title: 'Bright Suburban Classic',
    city: 'Raleigh',
    address: 'Raleigh, NC',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 2120,
    propertyType: 'house',
    listingType: 'sale' as const,
  },
];

export default function BuyPage() {
  return (
    <main className="bg-white py-20">
      <Container>
        <SectionHeader
          description="Preview homes for sale while the full listing search experience comes together."
          eyebrow="Buy"
          title="Homes for sale"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {homesForSale.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </Container>
    </main>
  );
}
