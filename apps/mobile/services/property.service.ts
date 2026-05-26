import { apiRequest } from '@/services/api';
import type {
  MyPropertiesResponse,
  PropertyDetails,
  PropertyListFilters,
  PropertyListResponse,
} from '@/types/property';

function toQueryString(filters: PropertyListFilters): string {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function getProperties(filters: PropertyListFilters = {}): Promise<PropertyListResponse> {
  return apiRequest<PropertyListResponse>(`/properties${toQueryString(filters)}`);
}

export function getPropertyById(propertyId: number): Promise<PropertyDetails> {
  return apiRequest<PropertyDetails>(`/properties/${propertyId}`, { requiresAuth: true });
}

export function getMyProperties(): Promise<MyPropertiesResponse> {
  return apiRequest<MyPropertiesResponse>('/me/properties', { requiresAuth: true });
}
