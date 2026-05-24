import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { Container } from '@/components/ui/container';
import { PropertyGallery } from '@/components/ui/property-gallery';
import { PropertyOverview } from '@/components/ui/property-overview';
import { PropertyDetailsSection } from '@/components/ui/property-details-section';
import { PropertySidebar } from '@/components/ui/property-sidebar';
import { getOrCreatePropertyGalleryImages } from '@/lib/properties/images';
import { propertyImageUrl } from '@/lib/properties/image-url';
import { getCurrentUser } from '@/lib/auth';
import { PropertyInquiryForm } from '@/components/properties/property-inquiry-form';
import { PropertyViewTracker } from '@/components/properties/property-view-tracker';
import { MakeOfferCard } from '@/components/offers/make-offer-card';
import { PropertyCard } from '@/components/ui/property-card';
import { getSimilarProperties, propertyDetailsHref } from '@/lib/properties/search';
import { formatCurrencyEUR } from '@/lib/format/currency';
import { absoluteUrl, defaultKeywords } from '@/lib/seo';
import { getTranslations } from '@/lib/i18n';
import type { AuthUser } from '@/lib/auth/types';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function canViewProperty(
  property: typeof properties.$inferSelect,
  user: AuthUser | null,
): boolean {
  return (
    (property.moderationStatus === 'approved' && property.isPublished) ||
    user?.role === 'admin' ||
    user?.id === property.createdByUserId
  );
}

async function getProperty(id: number, user: AuthUser | null) {
  try {
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .then((results) => results[0]);

    if (!property) {
      return null;
    }

    if (!canViewProperty(property, user)) {
      return null;
    }

    const images = await getOrCreatePropertyGalleryImages(property);
    const uploadedImages = images.map((img) => img.imageUrl);
    const fallbackImage = propertyImageUrl(property.imageCoverUrl, property.propertyType);

    return {
      property,
      images: uploadedImages.length > 0 ? uploadedImages : [fallbackImage],
    };
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: PropertyPageProps
): Promise<Metadata> {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist.',
    };
  }

  const user = await getCurrentUser();
  const data = await getProperty(numId, user);

  if (!data) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist.',
    };
  }

  const { property } = data;
  const coverImageUrl = propertyImageUrl(property.imageCoverUrl, property.propertyType);
  const description = `${property.propertyType} in ${property.city} with ${property.bedrooms} bedroom${property.bedrooms !== 1 ? 's' : ''} and ${property.areaSqm} m².`;

  return {
    title: `${property.title} | Estately`,
    description,
    keywords: [
      ...defaultKeywords,
      property.title,
      property.city,
      property.propertyType,
      property.listingType === 'rent' ? 'property for rent' : 'property for sale',
    ],
    alternates: {
      canonical: absoluteUrl(`/properties/${property.id}`),
    },
    openGraph: {
      title: `${property.title} | Estately`,
      description,
      type: 'website',
      url: absoluteUrl(`/properties/${property.id}`),
      images: [
        {
          url: absoluteUrl(coverImageUrl),
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.title} | Estately`,
      description,
      images: [absoluteUrl(coverImageUrl)],
    },
  };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function safeReturnTo(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/properties';
  }

  return value;
}

export default async function PropertyPage({ params, searchParams }: PropertyPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const numId = parseInt(id, 10);

  // Validate ID format
  if (isNaN(numId) || numId <= 0) {
    notFound();
  }

  // Fetch property data
  const user = await getCurrentUser();
  const t = await getTranslations();
  const data = await getProperty(numId, user);

  if (!data) {
    notFound();
  }

  const { property, images } = data;
  const price = formatCurrencyEUR(property.price);
  const galleryImages = [...new Set(images.map((image) => propertyImageUrl(image, property.propertyType)))];
  const coverImageUrl = galleryImages[0] ?? propertyImageUrl(property.imageCoverUrl, property.propertyType);

  const listingType = property.listingType === 'rent' ? 'rent' : 'sale';
  const currentUserIsOwner = user?.id === property.createdByUserId;
  const shouldOpenOfferForm = firstParam(query.intent) === 'offer';
  const returnTo = safeReturnTo(firstParam(query.returnTo));
  const similarProperties = await getSimilarProperties(property, 6);
  const similarSearchHref = `/${listingType === 'rent' ? 'rent' : 'sale'}?${new URLSearchParams({
    city: property.city,
    type: property.propertyType,
  }).toString()}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: absoluteUrl(`/properties/${property.id}`),
    image: galleryImages.map((image) => absoluteUrl(image)),
    datePosted: property.createdAt.toISOString(),
    offers: {
      '@type': 'Offer',
      price: Number(property.price),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      businessFunction: listingType === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
    },
    accommodationCategory: property.propertyType,
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.areaSqm,
      unitCode: 'MTK',
    },
  };

  return (
    <main className="py-12 bg-cream-50">
      <PropertyViewTracker propertyId={property.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Container className="min-w-0">
        <Link
          href={returnTo}
          className="mb-6 inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-charcoal-900 shadow-sm transition hover:border-estate-300 hover:bg-estate-50 hover:text-estate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
        >
          <span aria-hidden="true" className="mr-2">←</span>
          {t.backToResults}
        </Link>

        {/* Hero Section with Gallery */}
        <div className="mb-12">
          <PropertyGallery
            mainImage={coverImageUrl}
            title={property.title}
            allImages={galleryImages.slice(1)}
          />
        </div>

        {/* Content Section */}
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content - Left Column (2/3 width on desktop) */}
          <div className="min-w-0 space-y-12 lg:col-span-2">
            {/* Property Details Section */}
            <PropertyDetailsSection
              title={property.title}
              price={price}
              description={property.description}
              listingType={listingType}
            />

            {/* Property Overview */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal-950 mb-6">{t.propertySummary}</h2>
              <PropertyOverview
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                areaSqm={property.areaSqm}
                propertyType={property.propertyType}
                address={property.address}
                city={property.city}
              />
            </div>

            {/* Additional Details */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-estate-soft sm:p-8">
              <h2 className="text-2xl font-bold text-charcoal-950 mb-6">
                More Information
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                <div>
                  <p className="text-sm text-stone-600 mb-2">{t.propertyType}</p>
                  <p className="text-lg font-semibold text-charcoal-950">
                    {property.propertyType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">Listing Type</p>
                  <p className="text-lg font-semibold text-charcoal-950 capitalize">
                    For {listingType === 'rent' ? 'Rent' : 'Sale'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">Total Area</p>
                  <p className="text-lg font-semibold text-charcoal-950">
                    {property.areaSqm.toLocaleString()} m²
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">Rooms</p>
                  <p className="text-lg font-semibold text-charcoal-950">
                    {property.bedrooms + property.bathrooms} total
                  </p>
                </div>
              </div>
            </div>

            <PropertyInquiryForm isAuthenticated={Boolean(user)} propertyId={property.id} />
          </div>

          {/* Sidebar - Right Column (1/3 width on desktop) */}
          <div className="min-w-0 lg:col-span-1">
            <PropertySidebar
              price={price}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              areaSqm={property.areaSqm}
              address={property.address}
              listingType={listingType}
              offerSlot={
                <MakeOfferCard
                  currentUserIsOwner={currentUserIsOwner}
                  isAuthenticated={Boolean(user)}
                  propertyId={property.id}
                  shouldOpen={shouldOpenOfferForm}
                />
              }
            />
          </div>
        </div>

        {similarProperties.length > 0 ? (
          <section className="mt-16">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-charcoal-950 sm:text-3xl">{t.similarProperties}</h2>
                <p className="mt-2 max-w-2xl text-stone-600">{t.moreSimilarProperties}</p>
              </div>
              <Link
                href={similarSearchHref}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-charcoal-900 shadow-sm transition hover:border-estate-300 hover:bg-estate-50 hover:text-estate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 sm:w-auto"
              >
                See more similar properties
              </Link>
            </div>

            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
              {similarProperties.map((similarProperty) => {
                const similarListingType =
                  similarProperty.listingType === 'rent' ? 'rent' : 'sale';
                const similarReturnTo = `/${similarListingType === 'rent' ? 'rent' : 'sale'}?${new URLSearchParams({
                  city: similarProperty.city,
                  type: similarProperty.propertyType,
                }).toString()}`;

                return (
                  <div className="w-[min(20rem,82vw)] shrink-0 snap-start md:w-auto" key={similarProperty.id}>
                    <PropertyCard
                      id={similarProperty.id}
                      imageUrl={propertyImageUrl(
                        similarProperty.imageCoverUrl,
                        similarProperty.propertyType,
                      )}
                      price={formatCurrencyEUR(similarProperty.price)}
                      title={similarProperty.title}
                      city={similarProperty.city}
                      address={similarProperty.address}
                      bedrooms={similarProperty.bedrooms}
                      bathrooms={similarProperty.bathrooms}
                      areaSqm={similarProperty.areaSqm}
                      propertyType={similarProperty.propertyType}
                      listingType={similarListingType}
                      createdAt={similarProperty.createdAt}
                      views={similarProperty.views}
                      isFeatured={similarProperty.isFeatured}
                      detailsHref={propertyDetailsHref(similarProperty.id, similarReturnTo)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
