import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/src/db/client';
import { properties, propertyImages } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { Container } from '@/components/ui/container';
import { PropertyGallery } from '@/components/ui/property-gallery';
import { PropertyOverview } from '@/components/ui/property-overview';
import { PropertyDetailsSection } from '@/components/ui/property-details-section';
import { PropertySidebar } from '@/components/ui/property-sidebar';
import { propertyImageUrl } from '@/lib/properties/images';
import { getCurrentUser } from '@/lib/auth';
import { PropertyInquiryForm } from '@/components/properties/property-inquiry-form';
import { MakeOfferCard } from '@/components/offers/make-offer-card';
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

    // Fetch all images for this property
    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
      .then((results) =>
        results.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      );

    const uploadedImages = images.map((img) => img.imageUrl);

    return {
      property,
      images: uploadedImages.length > 0 ? uploadedImages : [propertyImageUrl(property.imageCoverUrl, property.propertyType)],
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
  const price = `$${Number(property.price).toLocaleString()}`;
  const coverImageUrl = propertyImageUrl(property.imageCoverUrl, property.propertyType);

  return {
    title: `${property.title} - ${price} | Estately`,
    description: `${property.title} in ${property.city}. ${property.bedrooms} bed${property.bedrooms !== 1 ? 's' : ''}, ${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''}, ${property.areaSqm}m². ${property.description.substring(0, 100)}...`,
    openGraph: {
      title: `${property.title} | Estately`,
      description: `${property.bedrooms} bed${property.bedrooms !== 1 ? 's' : ''}, ${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''} ${property.propertyType} in ${property.city}`,
      type: 'website',
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
  };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
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
  const data = await getProperty(numId, user);

  if (!data) {
    notFound();
  }

  const { property, images } = data;
  const price = `$${Number(property.price).toLocaleString()}`;
  const coverImageUrl = propertyImageUrl(images[0] ?? property.imageCoverUrl, property.propertyType);

  const listingType = property.listingType === 'rent' ? 'rent' : 'sale';
  const currentUserIsOwner = user?.id === property.createdByUserId;
  const shouldOpenOfferForm = firstParam(query.intent) === 'offer';

  return (
    <main className="py-12 bg-cream-50">
      <Container>
        {/* Hero Section with Gallery */}
        <div className="mb-12">
          <PropertyGallery
            mainImage={coverImageUrl}
            title={property.title}
            allImages={images.filter((image) => image !== coverImageUrl)}
          />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Property Details Section */}
            <PropertyDetailsSection
              title={property.title}
              price={price}
              description={property.description}
              listingType={listingType}
            />

            {/* Property Overview */}
            <div>
              <h2 className="text-2xl font-bold text-charcoal-950 mb-6">
                Property Features
              </h2>
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
            <div className="bg-white rounded-2xl border border-stone-200 shadow-estate-soft p-8">
              <h2 className="text-2xl font-bold text-charcoal-950 mb-6">
                More Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone-600 mb-2">Property Type</p>
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
          <div className="lg:col-span-1">
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
      </Container>
    </main>
  );
}
