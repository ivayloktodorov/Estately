import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { ContactAgentCard } from '@/components/property/contact-agent-card';
import { PropertyDetailsInfo } from '@/components/property/property-details-info';
import { PropertyImageGallery } from '@/components/property/property-image-gallery';
import { PropertySummary } from '@/components/property/property-summary';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/use-favorites';
import { getPropertyById } from '@/services/property.service';

function parsePropertyId(id: string | string[] | undefined): number | null {
  const value = Array.isArray(id) ? id[0] : id;
  const propertyId = Number(value);

  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = parsePropertyId(id);
  const favoriteIds = useFavoriteIds();
  const toggleFavoriteMutation = useToggleFavorite();
  const propertyQuery = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId ?? 0),
    enabled: propertyId !== null,
    retry: false,
  });

  if (!propertyId || propertyQuery.isError) {
    return (
      <Screen>
        <View className="flex-1 justify-center gap-5">
          <View className="gap-2">
            <Text className="text-center text-3xl font-bold text-slate-950">Property not found.</Text>
            <Text className="text-center text-base text-slate-600">
              This listing may no longer be available.
            </Text>
          </View>

          <Button label="Back to listings" onPress={() => router.replace('/(tabs)/home')} variant="secondary" />
        </View>
      </Screen>
    );
  }

  if (propertyQuery.isLoading || !propertyQuery.data) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#16a34a" />
          <Text className="text-base text-slate-600">Loading property...</Text>
        </View>
      </Screen>
    );
  }

  const property = propertyQuery.data;

  return (
    <Screen scroll>
      <View className="gap-6">
        <PropertyImageGallery property={property} />
        <PropertyDetailsInfo
          isFavorite={favoriteIds.has(property.id)}
          isFavoriteLoading={
            toggleFavoriteMutation.isPending &&
            toggleFavoriteMutation.variables?.property.id === property.id
          }
          onFavoritePress={() =>
            toggleFavoriteMutation.mutate({
              property,
              isFavorite: favoriteIds.has(property.id),
            })
          }
          property={property}
        />
        <PropertySummary property={property} />
        <ContactAgentCard propertyId={property.id} />
      </View>
    </Screen>
  );
}
