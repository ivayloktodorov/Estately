import { apiRequest } from '@/services/api';
import type { FavoriteMutationResponse, FavoritesResponse } from '@/types/property';

export function getFavorites(): Promise<FavoritesResponse> {
  return apiRequest<FavoritesResponse>('/favorites', { requiresAuth: true });
}

export function addFavorite(propertyId: number): Promise<FavoriteMutationResponse> {
  return apiRequest<FavoriteMutationResponse, { propertyId: number }>('/favorites', {
    method: 'POST',
    body: { propertyId },
    requiresAuth: true,
  });
}

export function removeFavorite(propertyId: number): Promise<FavoriteMutationResponse> {
  return apiRequest<FavoriteMutationResponse>(`/favorites/${propertyId}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}
