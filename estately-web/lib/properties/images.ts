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
