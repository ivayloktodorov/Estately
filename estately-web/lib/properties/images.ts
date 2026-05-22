export const PROPERTY_IMAGE_PLACEHOLDER_URL =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop';

export function propertyImageUrl(imageUrl: string | null | undefined): string {
  const trimmedUrl = imageUrl?.trim();
  return trimmedUrl ? trimmedUrl : PROPERTY_IMAGE_PLACEHOLDER_URL;
}
