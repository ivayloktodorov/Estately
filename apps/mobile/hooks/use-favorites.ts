import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthSession } from '@/hooks/use-auth';
import { addFavorite, getFavorites, removeFavorite } from '@/services/favorite.service';
import { ApiError } from '@/types/api';
import type { FavoritesResponse, Property } from '@/types/property';

export const favoritesQueryKey = ['favorites'] as const;

function redirectToLogin() {
  router.push('/(auth)/login');
}

export function useFavorites() {
  const sessionQuery = useAuthSession();
  const queryClient = useQueryClient();
  const favoritesQuery = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: getFavorites,
    enabled: Boolean(sessionQuery.data?.token),
    initialData: { properties: [] },
    retry: false,
  });

  useEffect(() => {
    if (favoritesQuery.error instanceof ApiError && favoritesQuery.error.status === 401) {
      queryClient.setQueryData(['auth', 'session'], null);
      router.replace('/(auth)/login');
    }
  }, [favoritesQuery.error, queryClient]);

  return favoritesQuery;
}

export function useFavoriteIds(): Set<number> {
  const favoritesQuery = useFavorites();

  return new Set(favoritesQuery.data.properties.map((property) => property.id));
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const sessionQuery = useAuthSession();

  return useMutation({
    mutationFn: async ({ property, isFavorite }: { property: Property; isFavorite: boolean }) => {
      if (!sessionQuery.data?.token) {
        redirectToLogin();
        return { propertyId: property.id, isFavorited: isFavorite };
      }

      return isFavorite ? removeFavorite(property.id) : addFavorite(property.id);
    },
    onMutate: async ({ property, isFavorite }) => {
      if (!sessionQuery.data?.token) {
        return undefined;
      }

      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previousFavorites = queryClient.getQueryData<FavoritesResponse>(favoritesQueryKey);

      queryClient.setQueryData<FavoritesResponse>(favoritesQueryKey, (current) => {
        const favorites = current?.properties ?? [];
        const nextFavorites = isFavorite
          ? favorites.filter((favorite) => favorite.id !== property.id)
          : [property, ...favorites.filter((favorite) => favorite.id !== property.id)];

        return { properties: nextFavorites };
      });

      return { previousFavorites };
    },
    onError: (error, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoritesQueryKey, context.previousFavorites);
      }

      if (error instanceof ApiError && error.status === 401) {
        queryClient.setQueryData(['auth', 'session'], null);
        router.replace('/(auth)/login');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
  });
}
