import { Link, router } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { PropertyCard } from '@/components/property/property-card';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/use-auth';
import { useFavorites, useFavoriteIds, useToggleFavorite } from '@/hooks/use-favorites';
import { t } from '@/lib/i18n';

export default function FavoritesScreen() {
  const sessionQuery = useAuthSession();
  const favoritesQuery = useFavorites();
  const favoriteIds = useFavoriteIds();
  const toggleFavoriteMutation = useToggleFavorite();

  if (!sessionQuery.data?.token) {
    return (
      <Screen>
        <View className="flex-1 justify-center gap-5">
          <View className="gap-2">
            <Text className="text-center text-3xl font-bold text-slate-950">{t('signInToSaveHomes')}</Text>
            <Text className="text-center text-base text-slate-600">
              {t('favoritesSignInDescription')}
            </Text>
          </View>

          <Button label={t('logIn')} onPress={() => router.push('/(auth)/login')} />
          <Link href="/(tabs)/search" asChild>
            <Button label={t('browseProperties')} variant="secondary" />
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-slate-50"
      contentContainerClassName="gap-4 px-5 py-6"
      data={favoritesQuery.data.properties}
      keyExtractor={(property) => String(property.id)}
      ListEmptyComponent={
        <View className="rounded-lg border border-slate-200 bg-white p-6">
          {favoritesQuery.isFetching ? (
            <View className="items-center gap-3">
              <ActivityIndicator color="#16a34a" />
              <Text className="text-base text-slate-600">{t('loadingFavorites')}</Text>
            </View>
          ) : favoritesQuery.isError ? (
            <View className="gap-4">
              <Text className="text-center text-base font-medium text-red-600">
                {t('unableToLoadFavorites')}
              </Text>
              <Button label={t('tryAgain')} onPress={() => favoritesQuery.refetch()} variant="secondary" />
            </View>
          ) : (
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-center text-2xl font-bold text-slate-950">
                  {t('noSavedProperties')}
                </Text>
                <Text className="text-center text-base text-slate-600">
                  {t('tapHeartToSave')}
                </Text>
              </View>

              <Link href="/(tabs)/search" asChild>
                <Button label={t('browseProperties')} variant="secondary" />
              </Link>
            </View>
          )}
        </View>
      }
      ListHeaderComponent={
        <View className="gap-2">
          <Text className="text-4xl font-bold text-slate-950">{t('savedHomes')}</Text>
          <Text className="text-base text-slate-600">{t('savedHomesDescription')}</Text>
        </View>
      }
      onRefresh={() => favoritesQuery.refetch()}
      refreshing={favoritesQuery.isRefetching}
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
          onPress={() => router.push(`/property/${item.id}`)}
          property={item}
        />
      )}
    />
  );
}
