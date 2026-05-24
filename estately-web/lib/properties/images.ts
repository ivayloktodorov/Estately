import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, propertyImages } from '@/src/db/schema';

export const PROPERTY_IMAGE_PLACEHOLDER_URL =
  '/images/property-placeholders/default.jpg';

const PROPERTY_PLACEHOLDER_BY_TYPE: Record<string, string> = {
  apartment: '/images/property-placeholders/apartment.jpg',
  house: '/images/property-placeholders/house.jpg',
  villa: '/images/property-placeholders/villa.jpg',
  office: '/images/property-placeholders/office.jpg',
  land: '/images/property-placeholders/land.jpg',
};

const INVALID_IMAGE_VALUES = new Set(['', 'null', 'undefined', '/images/property-placeholder.jpg']);

export function getPropertyPlaceholderImage(propertyType: string | null | undefined): string {
  const normalizedType = propertyType?.trim().toLowerCase();
  return normalizedType ? PROPERTY_PLACEHOLDER_BY_TYPE[normalizedType] ?? PROPERTY_IMAGE_PLACEHOLDER_URL : PROPERTY_IMAGE_PLACEHOLDER_URL;
}

export function propertyImageUrl(
  imageUrl: string | null | undefined,
  propertyType?: string | null,
): string {
  const trimmedUrl = imageUrl?.trim();
  return trimmedUrl && !INVALID_IMAGE_VALUES.has(trimmedUrl.toLowerCase())
    ? trimmedUrl
    : getPropertyPlaceholderImage(propertyType);
}

export function getPropertyImage(property: {
  imageCoverUrl?: string | null;
  propertyType?: string | null;
}): string {
  return propertyImageUrl(property.imageCoverUrl, property.propertyType);
}

function canCreateGalleryRecord(imageUrl: string | null | undefined): imageUrl is string {
  const trimmedUrl = imageUrl?.trim();

  return Boolean(trimmedUrl && !INVALID_IMAGE_VALUES.has(trimmedUrl.toLowerCase()));
}

export type PropertyGalleryImage = typeof propertyImages.$inferSelect;

export async function getOrCreatePropertyGalleryImages(property: {
  id: number;
  imageCoverUrl?: string | null;
  propertyType?: string | null;
}): Promise<PropertyGalleryImage[]> {
  const existingImages = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, property.id))
    .orderBy(desc(propertyImages.isCover), asc(propertyImages.sortOrder), asc(propertyImages.id));

  if (existingImages.length > 0) {
    return existingImages;
  }

  if (!canCreateGalleryRecord(property.imageCoverUrl)) {
    return [];
  }

  const [createdImage] = await db
    .insert(propertyImages)
    .values({
      propertyId: property.id,
      imageUrl: property.imageCoverUrl.trim(),
      sortOrder: 0,
      isCover: true,
    })
    .returning();

  return createdImage ? [createdImage] : [];
}

export async function syncPropertyCoverFromGallery(property: {
  id: number;
  imageCoverUrl?: string | null;
  propertyType?: string | null;
}): Promise<string> {
  const galleryImages = await getOrCreatePropertyGalleryImages(property);
  const coverImage = galleryImages.find((image) => image.isCover) ?? galleryImages[0];
  const coverImageUrl = coverImage?.imageUrl ?? getPropertyPlaceholderImage(property.propertyType);

  if (property.imageCoverUrl !== coverImageUrl) {
    await db
      .update(properties)
      .set({ imageCoverUrl: coverImageUrl, updatedAt: new Date() })
      .where(eq(properties.id, property.id));
  }

  return coverImageUrl;
}
