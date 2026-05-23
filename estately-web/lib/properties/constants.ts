export const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'office', 'land'] as const;

export const LISTING_TYPES = ['sale', 'rent'] as const;

export const PROPERTY_SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Price low to high', value: 'price_asc' },
  { label: 'Price high to low', value: 'price_desc' },
  { label: 'Largest area first', value: 'area_desc' },
  { label: 'Smallest area first', value: 'area_asc' },
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type ListingType = (typeof LISTING_TYPES)[number];
export type PropertySortValue = (typeof PROPERTY_SORT_OPTIONS)[number]['value'];
