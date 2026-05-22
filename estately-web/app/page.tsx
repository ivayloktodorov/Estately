import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button-link';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Modern Real Estate Search',
  description: 'Browse, save, and manage premium property listings with Estately.',
};

const featuredProperties = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900&auto=format&fit=crop',
    price: '$845,000',
    title: 'Glass House Retreat',
    location: 'North Scottsdale, AZ',
    meta: '4 beds / 3 baths / 3,180 sq ft',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&auto=format&fit=crop',
    price: '$612,500',
    title: 'Townhome Near the Park',
    location: 'Austin, TX',
    meta: '3 beds / 2.5 baths / 2,040 sq ft',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop',
    price: '$1,240,000',
    title: 'Modern Hillside Villa',
    location: 'Laguna Beach, CA',
    meta: '5 beds / 4 baths / 4,420 sq ft',
  },
];

const benefits = [
  {
    title: 'Curated search',
    description: 'Browse clean listing previews built for fast comparison across price, space, and location.',
  },
  {
    title: 'Saved homes',
    description: 'Keep favorite properties tied to your secure account and pick up your search anywhere.',
  },
  {
    title: 'Admin-ready',
    description: 'Role-based access gives platform teams a protected foundation for managing listings.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="bg-cream-50">
        <Container className="grid min-h-[calc(100vh-5rem)] items-center gap-12 py-14 lg:grid-cols-[1fr_0.92fr] lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-estate-700">
              Premium property search
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold text-charcoal-950">
              Find the right home with a calmer way to search.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              Estately brings modern real estate discovery, saved favorites, and protected account
              workflows into one elegant platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/buy">Browse Properties</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Login
              </ButtonLink>
              <ButtonLink href="/register" variant="ghost">
                Register
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden rounded-xl bg-[url('https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-xl shadow-charcoal-950/10">
            <div className="absolute bottom-5 left-5 right-5 rounded-lg bg-white/95 p-6 shadow-xl backdrop-blur">
              <p className="text-sm font-semibold text-estate-700">Market snapshot</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-charcoal-950">2.4k</p>
                  <p className="mt-1 text-xs text-stone-500">Active listings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-950">18</p>
                  <p className="mt-1 text-xs text-stone-500">Cities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-950">24h</p>
                  <p className="mt-1 text-xs text-stone-500">Fresh updates</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              description="A first look at the kind of premium listing experience Estately is built to support."
              eyebrow="Featured homes"
              title="Homes worth a closer look"
            />
            <ButtonLink href="/buy" variant="secondary">
              View all
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.title} {...property} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-20">
        <Container>
          <SectionHeader
            align="center"
            description="A clean product foundation for buyers, renters, and platform operators."
            eyebrow="Why Estately"
            title="Built for focused real estate decisions"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                className="rounded-xl border border-stone-200 bg-white p-8 shadow-estate-soft hover:shadow-estate transition"
                key={benefit.title}
              >
                <h3 className="text-xl font-bold text-charcoal-950">{benefit.title}</h3>
                <p className="mt-3 leading-relaxed text-stone-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-estate-800 py-20 text-white">
        <Container className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cream-100">
              Ready when you are
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-bold">
              Start saving homes and building your shortlist today.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink className="bg-cream-50 text-estate-800 hover:bg-cream-100" href="/register">
              Register
            </ButtonLink>
            <ButtonLink
              className="border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
              href="/contact"
              variant="outline"
            >
              Contact us
            </ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
