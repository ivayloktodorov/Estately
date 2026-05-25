import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/src/db/client';
import { properties, users } from '@/src/db/schema';
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
import {
  getPropertyVisibilityDecision,
  isPublicPropertyVisible,
} from '@/lib/properties/visibility';
import type { AuthUser } from '@/lib/auth/types';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

type PropertyLoadReason =
  | 'invalid-id'
  | 'missing-main-property'
  | 'access-denied'
  | 'visible'
  | 'unknown-loader-error';

interface PropertyLoadResult {
  property: typeof properties.$inferSelect;
}

interface PropertyLoadMiss {
  property: typeof properties.$inferSelect | null;
  reason: PropertyLoadReason;
}

function logPropertyDetailsDecision(input: {
  requestedId: string;
  parsedId: number | null;
  property: typeof properties.$inferSelect | null,
  user: AuthUser | null,
  canView: boolean;
  reason: PropertyLoadReason;
}) {
  const { requestedId, parsedId, property, user, canView, reason } = input;

  console.log('[property-details]', {
    requestedPropertyId: requestedId,
    parsedPropertyId: parsedId,
    foundById: Boolean(property),
    foundPropertyId: property?.id ?? null,
    isPublished: property?.isPublished ?? null,
    moderationStatus: property?.moderationStatus ?? null,
    currentUserId: user?.id ?? null,
    currentUserRole: user?.role ?? null,
    isOwner: Boolean(user && property && user.id === property.createdByUserId),
    canView,
    reason,
  });
}

function logPropertyDetailsNotFound(input: {
  id: string;
  parsedId: number | null;
  property: typeof properties.$inferSelect | null;
  user: AuthUser | null;
  reason: PropertyLoadReason;
}) {
  const { id, parsedId, property, user, reason } = input;
  const visibility = property ? getPropertyVisibilityDecision(property, user) : null;

  console.error('[property-details-not-found]', {
    id,
    parsedId,
    foundByIdOnly: Boolean(property),
    isPublished: property?.isPublished ?? null,
    moderationStatus: property?.moderationStatus ?? null,
    currentUserRole: user?.role ?? 'guest',
    isOwner: visibility?.isOwner ?? false,
    reason,
  });
}

function logOptionalPropertyDetailsError(input: {
  id: number;
  reason: 'missing-gallery' | 'missing-images' | 'similar-properties-error' | 'missing-owner' | 'offer-loader-error' | 'metadata-error';
  error: unknown;
}) {
  console.warn('[property-details-optional-error]', {
    id: input.id,
    reason: input.reason,
    message: input.error instanceof Error ? input.error.message : 'Unknown optional loader error',
  });
}

function logPropertyDetailsRender(input: {
  id: number;
  title: string;
  galleryCount: number;
  similarCount: number;
  ownerLoaded: boolean;
}) {
  console.log('[property-details-render]', {
    id: input.id,
    propertyTitle: input.title,
    canView: true,
    galleryCount: input.galleryCount,
    similarCount: input.similarCount,
    ownerLoaded: input.ownerLoaded ? 'yes' : 'no',
  });
}

function parsePropertyId(id: string): number | null {
  const propertyId = Number(id);

  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

async function getPropertyByIdOnly(propertyId: number): Promise<typeof properties.$inferSelect | null> {
  return db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((results) => results[0] ?? null);
}

async function getPropertyForMetadata(
  requestedId: string,
  propertyId: number,
  user: AuthUser | null,
): Promise<typeof properties.$inferSelect | null> {
  try {
    const property = await getPropertyByIdOnly(propertyId);

    if (!property) {
      return null;
    }

    return getPropertyVisibilityDecision(property, user).canView ? property : null;
  } catch (error) {
    console.error('[property-details-not-found]', {
      id: requestedId,
      parsedId: propertyId,
      foundByIdOnly: false,
      isPublished: null,
      moderationStatus: null,
      currentUserRole: user?.role ?? 'guest',
      isOwner: false,
      reason: 'metadata-error',
      message: error instanceof Error ? error.message : 'Unknown metadata query error',
    });

    return null;
  }
}

async function getProperty(
  requestedId: string,
  propertyId: number,
  user: AuthUser | null,
): Promise<PropertyLoadResult | PropertyLoadMiss> {
  try {
    const property = await getPropertyByIdOnly(propertyId);

    if (!property) {
      logPropertyDetailsDecision({
        requestedId,
        parsedId: propertyId,
        property: null,
        user,
        canView: false,
        reason: 'missing-main-property',
      });
      return { property: null, reason: 'missing-main-property' };
    }

    const visibility = getPropertyVisibilityDecision(property, user);

    if (!visibility.canView) {
      logPropertyDetailsDecision({
        requestedId,
        parsedId: propertyId,
        property,
        user,
        canView: false,
        reason: 'access-denied',
      });
      return { property, reason: 'access-denied' };
    }

    logPropertyDetailsDecision({
      requestedId,
      parsedId: propertyId,
      property,
      user,
      canView: true,
      reason: 'visible',
    });

    return {
      property,
    };
  } catch (error) {
    console.error('[property-details]', {
      requestedPropertyId: requestedId,
      parsedPropertyId: propertyId,
      foundById: false,
      currentUserId: user?.id ?? null,
      currentUserRole: user?.role ?? null,
      canView: false,
      reason: 'unknown-loader-error',
      message: error instanceof Error ? error.message : 'Unknown property query error',
    });
    return { property: null, reason: 'unknown-loader-error' };
  }
}

async function getOptionalGalleryImages(property: typeof properties.$inferSelect): Promise<string[]> {
  const fallbackImage = propertyImageUrl(property.imageCoverUrl, property.propertyType);

  try {
    const images = await getOrCreatePropertyGalleryImages(property);
    const uploadedImages = images.map((img) => img.imageUrl);

    return uploadedImages.length > 0 ? uploadedImages : [fallbackImage];
  } catch (error) {
    logOptionalPropertyDetailsError({
      id: property.id,
      reason: 'missing-gallery',
      error,
    });

    return [fallbackImage];
  }
}

async function getOptionalSimilarProperties(property: typeof properties.$inferSelect) {
  try {
    return await getSimilarProperties(property, 6);
  } catch (error) {
    logOptionalPropertyDetailsError({
      id: property.id,
      reason: 'similar-properties-error',
      error,
    });

    return [];
  }
}

async function getOptionalOwner(property: typeof properties.$inferSelect) {
  try {
    return db
      .select({
        id: users.id,
        fullName: users.fullName,
      })
      .from(users)
      .where(eq(users.id, property.createdByUserId))
      .then((results) => results[0] ?? null);
  } catch (error) {
    logOptionalPropertyDetailsError({
      id: property.id,
      reason: 'missing-owner',
      error,
    });

    return null;
  }
}

export async function generateMetadata(
  { params }: PropertyPageProps
): Promise<Metadata> {
  const { id } = await params;
  const propertyId = parsePropertyId(id);

  if (!propertyId) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist.',
    };
  }

  const user = await getCurrentUser();
  const property = await getPropertyForMetadata(id, propertyId, user);

  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist.',
    };
  }

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
  const propertyId = parsePropertyId(id);

  if (!propertyId) {
    logPropertyDetailsNotFound({
      id,
      parsedId: null,
      property: null,
      user: null,
      reason: 'invalid-id',
    });
    logPropertyDetailsDecision({
      requestedId: id,
      parsedId: null,
      property: null,
      user: null,
      canView: false,
      reason: 'invalid-id',
    });
    notFound();
  }

  const user = await getCurrentUser();
  const t = await getTranslations();
  const data = await getProperty(id, propertyId, user);

  if ('reason' in data) {
    logPropertyDetailsNotFound({
      id,
      parsedId: propertyId,
      property: data.property,
      user,
      reason: data.reason,
    });
    notFound();
  }

  const { property } = data;
  const [images, similarProperties, owner] = await Promise.all([
    getOptionalGalleryImages(property),
    getOptionalSimilarProperties(property),
    getOptionalOwner(property),
  ]);
  const price = formatCurrencyEUR(property.price);
  const galleryImages = [...new Set(images.map((image) => propertyImageUrl(image, property.propertyType)))];
  const coverImageUrl = galleryImages[0] ?? propertyImageUrl(property.imageCoverUrl, property.propertyType);

  const listingType = property.listingType === 'rent' ? 'rent' : 'sale';
  const currentUserIsOwner = user?.id === property.createdByUserId;
  const canContactAgent = isPublicPropertyVisible(property);
  const shouldOpenOfferForm = firstParam(query.intent) === 'offer';
  const returnTo = safeReturnTo(firstParam(query.returnTo));
  const similarSearchHref = `/${listingType === 'rent' ? 'rent' : 'sale'}?${new URLSearchParams({
    city: property.city,
    type: property.propertyType,
  }).toString()}`;

  logPropertyDetailsRender({
    id: property.id,
    title: property.title,
    galleryCount: galleryImages.length,
    similarCount: similarProperties.length,
    ownerLoaded: Boolean(owner),
  });

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

            {canContactAgent ? (
              <PropertyInquiryForm isAuthenticated={Boolean(user)} propertyId={property.id} />
            ) : null}
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
                canContactAgent ? (
                  <MakeOfferCard
                    currentUserIsOwner={currentUserIsOwner}
                    isAuthenticated={Boolean(user)}
                    propertyId={property.id}
                    shouldOpen={shouldOpenOfferForm}
                  />
                ) : null
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
