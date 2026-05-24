export const PROPERTY_IMAGE_PLACEHOLDER_URL =
  '/images/property-placeholder.jpg';

const INVALID_IMAGE_VALUES = new Set(['', 'null', 'undefined']);

export function propertyImageUrl(imageUrl: string | null | undefined): string {
  const trimmedUrl = imageUrl?.trim();
  return trimmedUrl && !INVALID_IMAGE_VALUES.has(trimmedUrl.toLowerCase())
    ? trimmedUrl
    : PROPERTY_IMAGE_PLACEHOLDER_URL;
}
