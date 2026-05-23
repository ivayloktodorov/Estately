export interface PropertyImage {
  id: number;
  propertyId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface Property {
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
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  favoritedAt?: string;
}

export interface PropertyDetails extends Property {
  images: PropertyImage[];
}

export interface PropertyListFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PropertyListResponse {
  properties: Property[];
  pagination: PaginationMeta;
}

export interface FavoritesResponse {
  properties: Property[];
}

export interface FavoriteMutationResponse {
  propertyId: number;
  isFavorited: boolean;
}
