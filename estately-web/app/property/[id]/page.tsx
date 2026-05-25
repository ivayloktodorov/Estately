import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { Container } from '@/components/ui/container';
import { MakeOfferCard } from '@/components/offers/make-offer-card';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyDetailsSection } from '@/components/ui/property-details-section';
import { PropertyGallery } from '@/components/ui/property-gallery';
import { PropertyInquiryForm } from '@/components/properties/property-inquiry-form';
import { PropertyOverview } from '@/components/ui/property-overview';
import { PropertySidebar } from '@/components/ui/property-sidebar';
import { PropertyViewTracker } from '@/components/properties/property-view-tracker';
import { getCurrentUser } from '@/lib/auth';
import { propertyImageUrl } from '@/lib/properties/image-url';
import { getOrCreatePropertyGalleryImages } from '@/lib/properties/images';
import { canViewProperty } from '@/lib/properties/visibility';
import { getSimilarProperties, propertyDetailsHref } from '@/lib/properties/search';
import { absoluteUrl, defaultKeywords } from '@/lib/seo';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';
import type { AuthUser } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const webPropertyDetailsColumns = {
  id: properties.id,
  title: properties.title,
  description: properties.description,
  price: properties.price,
  city: properties.city,
  address: properties.address,
  propertyType: properties.propertyType,
  listingType: properties.listingType,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  areaSqm: properties.areaSqm,
  latitude: properties.latitude,
  longitude: properties.longitude,
  imageCoverUrl: properties.imageCoverUrl,
  isPublished: properties.isPublished,
  moderationStatus: properties.moderationStatus,
  createdByUserId: properties.createdByUserId,
  isFeatured: sql<boolean>`false`,
  views: sql<number>`0`,
  createdAt: properties.createdAt,
  updatedAt: properties.updatedAt,
};

type WebPropertyDetails = {
  id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  address: string;
  propertyType: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  latitude: string | null;
  longitude: string | null;
  imageCoverUrl: string;
  isPublished: boolean;
  moderationStatus: string;
  createdByUserId: number;
  isFeatured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
};

interface WebPropertyData {
  property: WebPropertyDetails;
  images: string[];
}

function parsePropertyId(id: string): number | null {
  const propertyId = Number(id);

  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

async function getWebPropertyDetails(
  propertyId: number,
  user: AuthUser | null,
): Promise<WebPropertyData | null> {
  const property = await db
    .select(webPropertyDetailsColumns)
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((results) => results[0] as WebPropertyDetails | undefined);

  if (!property || !canViewProperty(property, user)) {
    return null;
  }

  const galleryImages = await getOrCreatePropertyGalleryImages(property);
  const uploadedImages = galleryImages.map((image) => image.imageUrl);
  const fallbackImage = propertyImageUrl(property.imageCoverUrl, property.propertyType);

  return {
    property,
    images: uploadedImages.length > 0 ? uploadedImages : [fallbackImage],
  };
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const propertyId = parsePropertyId(id);

  if (!propertyId) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist.',
    };
  }

  const user = await getCurrentUser();
  const data = await getWebPropertyDetails(propertyId, user);

  if (!data) {
    return {
      title: 'Property Not Found',
      description: 'The property you are looking for does not exist.',
    };
  }

  const { property } = data;
  const coverImageUrl = propertyImageUrl(property.imageCoverUrl, property.propertyType);
  const description = `${property.propertyType} in ${property.city} with ${property.bedrooms} bedroom${property.bedrooms !== 1 ? 's' : ''} and ${property.areaSqm} m².`;
  const canonicalPath = `/property/${property.id}`;

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
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      title: `${property.title} | Estately`,
      description,
      type: 'website',
      url: absoluteUrl(canonicalPath),
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
    notFound();
  }

  const user = await getCurrentUser();
  const data = await getWebPropertyDetails(propertyId, user);

  if (!data) {
    notFound();
  }

  const { property, images } = data;
  const price = `$${Number(property.price).toLocaleString()}`;
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
  const canonicalUrl = absoluteUrl(`/property/${property.id}`);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: canonicalUrl,
    image: galleryImages.map((image) => absoluteUrl(image)),
    datePosted: property.createdAt.toISOString(),
    offers: {
      '@type': 'Offer',
      price: Number(property.price),
      priceCurrency: 'USD',
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
    <main className="bg-cream-50 py-12">
      <PropertyViewTracker propertyId={property.id} />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <Container className="min-w-0">
        <Link
          className="mb-6 inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-charcoal-900 shadow-sm transition hover:border-estate-300 hover:bg-estate-50 hover:text-estate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2"
          href={returnTo}
        >
          <span aria-hidden="true" className="mr-2">←</span>
          Back to results
        </Link>

        <div className="mb-12">
          <PropertyGallery
            allImages={galleryImages.slice(1)}
            mainImage={coverImageUrl}
            title={property.title}
          />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="min-w-0 space-y-12 lg:col-span-2">
            <PropertyDetailsSection
              description={property.description}
              listingType={listingType}
              price={price}
              title={property.title}
            />

            <div>
              <h2 className="mb-6 text-2xl font-bold text-charcoal-950">
                Property Features
              </h2>
              <PropertyOverview
                address={property.address}
                areaSqm={property.areaSqm}
                bathrooms={property.bathrooms}
                bedrooms={property.bedrooms}
                city={property.city}
                propertyType={property.propertyType}
              />
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-estate-soft sm:p-8">
              <h2 className="mb-6 text-2xl font-bold text-charcoal-950">
                More Information
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                <div>
                  <p className="mb-2 text-sm text-stone-600">Property Type</p>
                  <p className="text-lg font-semibold text-charcoal-950">
                    {property.propertyType}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-stone-600">Listing Type</p>
                  <p className="text-lg font-semibold capitalize text-charcoal-950">
                    For {listingType === 'rent' ? 'Rent' : 'Sale'}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-stone-600">Total Area</p>
                  <p className="text-lg font-semibold text-charcoal-950">
                    {property.areaSqm.toLocaleString()} m²
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-stone-600">Rooms</p>
                  <p className="text-lg font-semibold text-charcoal-950">
                    {property.bedrooms + property.bathrooms} total
                  </p>
                </div>
              </div>
            </div>

            <PropertyInquiryForm isAuthenticated={Boolean(user)} propertyId={property.id} />
          </div>

          <div className="min-w-0 lg:col-span-1">
            <PropertySidebar
              address={property.address}
              areaSqm={property.areaSqm}
              bathrooms={property.bathrooms}
              bedrooms={property.bedrooms}
              listingType={listingType}
              offerSlot={
                <MakeOfferCard
                  currentUserIsOwner={currentUserIsOwner}
                  isAuthenticated={Boolean(user)}
                  propertyId={property.id}
                  shouldOpen={shouldOpenOfferForm}
                />
              }
              price={price}
            />
          </div>
        </div>

        {similarProperties.length > 0 ? (
          <section className="mt-16">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-charcoal-950 sm:text-3xl">Similar properties</h2>
                <p className="mt-2 max-w-2xl text-stone-600">
                  More {listingType === 'rent' ? 'rentals' : 'homes for sale'} like this in and around {property.city}.
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-charcoal-900 shadow-sm transition hover:border-estate-300 hover:bg-estate-50 hover:text-estate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-700 focus-visible:ring-offset-2 sm:w-auto"
                href={similarSearchHref}
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
                      address={similarProperty.address}
                      areaSqm={similarProperty.areaSqm}
                      bathrooms={similarProperty.bathrooms}
                      bedrooms={similarProperty.bedrooms}
                      city={similarProperty.city}
                      createdAt={similarProperty.createdAt}
                      detailsHref={propertyDetailsHref(similarProperty.id, similarReturnTo)}
                      id={similarProperty.id}
                      imageUrl={propertyImageUrl(
                        similarProperty.imageCoverUrl,
                        similarProperty.propertyType,
                      )}
                      isFeatured={similarProperty.isFeatured}
                      listingType={similarListingType}
                      price={`$${Number(similarProperty.price).toLocaleString()}`}
                      propertyType={similarProperty.propertyType}
                      title={similarProperty.title}
                      views={similarProperty.views}
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
