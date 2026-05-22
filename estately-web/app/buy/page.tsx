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
    imageUrl:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop',
    price: '$735,000',
    title: 'Garden District Home',
    location: 'Portland, OR',
    meta: '4 beds / 3 baths / 2,860 sq ft',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=900&auto=format&fit=crop',
    price: '$980,000',
    title: 'Contemporary Courtyard House',
    location: 'Denver, CO',
    meta: '5 beds / 4 baths / 3,740 sq ft',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&auto=format&fit=crop',
    price: '$549,000',
    title: 'Bright Suburban Classic',
    location: 'Raleigh, NC',
    meta: '3 beds / 2 baths / 2,120 sq ft',
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
            <PropertyCard key={property.title} {...property} />
          ))}
        </div>
      </Container>
    </main>
  );
}
