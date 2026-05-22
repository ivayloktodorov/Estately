export const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'office', 'land'] as const;

export const LISTING_TYPES = ['sale', 'rent'] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type ListingType = (typeof LISTING_TYPES)[number];
