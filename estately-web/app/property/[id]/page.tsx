import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { formatCurrencyEUR } from '@/lib/format/currency';
import { getCurrentUser } from '@/lib/auth';
import { getMobilePropertyDetails } from '@/lib/mobile-api/properties';
import { propertyImageUrl } from '@/lib/properties/image-url';
import { canViewProperty } from '@/lib/properties/visibility';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

function parsePropertyId(id: string): number | null {
  const propertyId = Number(id);

  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const propertyId = parsePropertyId(id);

  if (!propertyId) {
    return {};
  }

  const property = await getMobilePropertyDetails(propertyId);

  if (!property || !canViewProperty(property, null)) {
    return {};
  }

  const canonicalPath = `/property/${property.id}`;
  const description = `${property.title} in ${property.city}. ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.areaSqm} sqm.`;

  return {
    title: property.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: property.title,
      description,
      url: absoluteUrl(canonicalPath),
      images: [
        {
          url: propertyImageUrl(property.imageCoverUrl, property.propertyType),
          alt: property.title,
        },
      ],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const propertyId = parsePropertyId(id);

  if (!propertyId) {
    console.error('[property-details-not-found]', {
      id,
      parsedId: null,
      foundByIdOnly: false,
      reason: 'invalid-id',
    });
    notFound();
  }

  const property = await getMobilePropertyDetails(propertyId);

  if (!property) {
    console.error('[property-details-not-found]', {
      id,
      parsedId: propertyId,
      foundByIdOnly: false,
      reason: 'missing-main-property',
    });
    notFound();
  }

  if (!canViewProperty(property, null)) {
    const user = await getCurrentUser();

    if (!canViewProperty(property, user)) {
      console.error('[property-details-not-found]', {
        id,
        parsedId: propertyId,
        foundByIdOnly: true,
        reason: 'visibility-denied',
      });
      notFound();
    }
  }

  const listingType = property.listingType === 'rent' ? 'rent' : 'sale';
  const imageUrl = propertyImageUrl(property.imageCoverUrl, property.propertyType);

  console.log('[property-details-render]', {
    id: property.id,
    propertyTitle: property.title,
    canView: true,
    mode: 'minimal-replacement',
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="space-y-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <Image
          alt={property.title}
          className="aspect-video w-full rounded-md object-cover"
          height={540}
          src={imageUrl}
          width={960}
        />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Property #{property.id}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-charcoal-950">
            {property.title}
          </h1>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-stone-500">Price</dt>
            <dd className="text-lg font-semibold text-charcoal-950">
              {formatCurrencyEUR(property.price)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">City</dt>
            <dd className="text-lg font-semibold text-charcoal-950">{property.city}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Address</dt>
            <dd className="text-lg font-semibold text-charcoal-950">{property.address}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Property Type</dt>
            <dd className="text-lg font-semibold text-charcoal-950">{property.propertyType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Listing Type</dt>
            <dd className="text-lg font-semibold capitalize text-charcoal-950">{listingType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Visibility</dt>
            <dd className="text-lg font-semibold text-charcoal-950">
              {property.isPublished ? 'published' : 'unpublished'} / {property.moderationStatus}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
