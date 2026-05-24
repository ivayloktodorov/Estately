import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { PropertyCard } from '@/components/property/property-card';
import { Button } from '@/components/ui/button';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/use-favorites';
import { t } from '@/lib/i18n';
import { getProperties } from '@/services/property.service';
import type { Property } from '@/types/property';

const pageSize = 10;

function flattenProperties(pages: { properties: Property[] }[] | undefined): Property[] {
  return pages?.flatMap((page) => page.properties) ?? [];
}

export default function HomeScreen() {
  const propertiesQuery = useInfiniteQuery({
    queryKey: ['properties', 'home'],
    queryFn: ({ pageParam }) => getProperties({ page: pageParam, limit: pageSize }),
    initialPageParam: 1,
    retry: false,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
  });
  const favoriteIds = useFavoriteIds();
  const toggleFavoriteMutation = useToggleFavorite();
  const properties = flattenProperties(propertiesQuery.data?.pages);
  const hasProperties = properties.length > 0;

  function handleLoadMore() {
    if (propertiesQuery.hasNextPage && !propertiesQuery.isFetchingNextPage) {
      propertiesQuery.fetchNextPage();
    }
  }

  return (
    <FlatList
      className="flex-1 bg-slate-50"
      contentContainerClassName="gap-4 px-5 py-6"
      data={properties}
      keyExtractor={(property) => String(property.id)}
      ListEmptyComponent={
        <View className="rounded-lg border border-slate-200 bg-white p-6">
          {propertiesQuery.isPending ? (
            <View className="items-center gap-3">
              <ActivityIndicator color="#16a34a" />
              <Text className="text-base text-slate-600">{t('loadingProperties')}</Text>
            </View>
          ) : propertiesQuery.isError ? (
            <View className="gap-4">
              <Text className="text-center text-base font-medium text-red-600">
                {t('unableToLoadProperties')}
              </Text>
              <Button label={t('tryAgain')} onPress={() => propertiesQuery.refetch()} variant="secondary" />
            </View>
          ) : (
            <Text className="text-center text-base text-slate-600">{t('noPropertiesFound')}</Text>
          )}
        </View>
      }
      ListFooterComponent={
        hasProperties ? (
          <View className="pb-4 pt-2">
            {propertiesQuery.hasNextPage ? (
              <Button
                disabled={propertiesQuery.isFetchingNextPage}
                label={propertiesQuery.isFetchingNextPage ? t('loading') : t('loadMore')}
                onPress={handleLoadMore}
                variant="secondary"
              />
            ) : (
              <Text className="text-center text-sm text-slate-500">{t('endOfResults')}</Text>
            )}
          </View>
        ) : null
      }
      ListHeaderComponent={
        <View className="gap-2">
          <Text className="text-4xl font-bold text-slate-950">Estately</Text>
          <Text className="text-base text-slate-600">{t('findYourNextHome')}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <PropertyCard
          isFavorite={favoriteIds.has(item.id)}
          isFavoriteLoading={
            toggleFavoriteMutation.isPending &&
            toggleFavoriteMutation.variables?.property.id === item.id
          }
          onFavoritePress={() =>
            toggleFavoriteMutation.mutate({ property: item, isFavorite: favoriteIds.has(item.id) })
          }
          property={item}
          onPress={() => router.push(`/property/${item.id}`)}
        />
      )}
    />
  );
}
