import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';
import { Container } from '@/components/ui/container';
import { PropertyCard } from '@/components/ui/property-card';
import { SectionHeader } from '@/components/ui/section-header';
import { getCurrentUser } from '@/lib/auth';
import { formatPropertyCard, getNewestProperties, getTrendingProperties } from '@/lib/properties/discovery';
import { createSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...createSeoMetadata({
    title: 'Estately | Find homes for sale and rent',
    description: 'Browse homes, apartments, villas and land listings for sale or rent.',
    path: '/',
    keywords: ['property marketplace', 'buy property', 'rent property'],
  }),
};

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

export default async function HomePage() {
  const [user, newestProperties, trendingProperties] = await Promise.all([
    getCurrentUser(),
    getNewestProperties(8),
    getTrendingProperties(8),
  ]);
  const newestCards = newestProperties.map(formatPropertyCard);
  const trendingCards = trendingProperties.map(formatPropertyCard);

  return (
    <main>
      <section className="bg-cream-50">
        <Container className="grid min-h-[calc(100vh-5rem)] items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_0.92fr] lg:gap-12 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-estate-700">
              Premium property search
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold text-charcoal-950 sm:text-6xl lg:text-7xl">
              Find the right home with a calmer way to search.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              Estately brings modern real estate discovery, saved favorites, and protected account
              workflows into one elegant platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {user ? (
                <ButtonLink href="/sale">Continue browsing</ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/sale">Browse Properties</ButtonLink>
                  <ButtonLink href="/login" variant="secondary">
                    Login
                  </ButtonLink>
                  <ButtonLink href="/register" variant="ghost">
                    Register
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-xl bg-[url('https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&auto=format&fit=crop')] bg-cover bg-center shadow-xl shadow-charcoal-950/10 sm:min-h-[460px] lg:min-h-[520px]">
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/95 p-4 shadow-xl backdrop-blur sm:bottom-5 sm:left-5 sm:right-5 sm:p-6">
              <p className="text-sm font-semibold text-estate-700">Market snapshot</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:gap-3">
                <div>
                  <p className="text-xl font-bold text-charcoal-950 sm:text-2xl">2.4k</p>
                  <p className="mt-1 text-xs text-stone-500">Active listings</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-charcoal-950 sm:text-2xl">18</p>
                  <p className="mt-1 text-xs text-stone-500">Cities</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-charcoal-950 sm:text-2xl">24h</p>
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
              description="The latest approved homes, apartments, villas, offices, and land listings on Estately."
              eyebrow="Newest listings"
              title="Recently added properties"
            />
            <ButtonLink className="w-full sm:w-auto" href="/sale" variant="secondary">
              View all
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {newestCards.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </Container>
      </section>

      {trendingCards.length > 0 ? (
        <section className="bg-cream-50 py-20">
          <Container>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeader
                description="Popular public listings ranked by favorites, views, and recent marketplace activity."
                eyebrow="Trending properties"
                title="Properties getting attention"
              />
              <ButtonLink className="w-full sm:w-auto" href="/properties" variant="secondary">
                Explore more
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {trendingCards.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-white py-20">
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

      <section className="border-y border-estate-100 bg-cream-50 py-20 text-charcoal-950">
        <Container className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-estate-700">
              Ready when you are
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold sm:text-4xl">
              Start saving homes and building your shortlist today.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-estate-700 px-6 py-3 text-sm font-bold text-white shadow-estate-soft transition hover:bg-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
              href="/sale"
            >
              Browse Properties
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-estate-200 bg-white px-6 py-3 text-sm font-bold text-estate-700 shadow-sm transition hover:border-brand-purple hover:bg-estate-50 hover:text-estate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
              href={user ? '/favorites' : '/register'}
            >
              {user ? 'View Favorites' : 'Create Account'}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
