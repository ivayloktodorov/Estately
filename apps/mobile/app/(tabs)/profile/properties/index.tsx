import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { formatPrice } from '@/components/property/property-format';
import { Button } from '@/components/ui/button';
import { getMyProperties } from '@/services/property.service';
import type { MyProperty } from '@/types/property';

function statusLabel(property: MyProperty): string {
  if (property.isPublished) return 'Published';
  if (property.moderationStatus === 'rejected') return 'Rejected';
  if (property.moderationStatus === 'approved') return 'Approved';

  return 'Pending review';
}

function MyPropertyCard({ property }: { property: MyProperty }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm active:bg-slate-50"
      onPress={() => router.push(`/(tabs)/property/${property.id}`)}>
      <Image
        accessibilityIgnoresInvertColors
        className="h-40 w-full bg-slate-200"
        resizeMode="cover"
        source={{ uri: property.imageCoverUrl }}
      />
      <View className="gap-2 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-lg font-bold text-slate-950">{property.title}</Text>
          <Text className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            {statusLabel(property)}
          </Text>
        </View>
        <Text className="text-base font-bold text-brand-700">
          {formatPrice(property.price)}
        </Text>
        <Text className="text-sm text-slate-600">
          {property.city} - {property.address}
        </Text>
      </View>
    </Pressable>
  );
}

export default function MyPropertiesScreen() {
  const propertiesQuery = useQuery({
    queryKey: ['properties', 'mine'],
    queryFn: getMyProperties,
    retry: false,
  });

  const properties = propertiesQuery.data ?? [];

  return (
    <Screen scroll>
      <View className="gap-5">
        <View className="gap-3">
          <Button label="Back to Profile" onPress={() => router.push('/(tabs)/profile')} variant="secondary" />
          <View className="gap-2">
            <Text className="text-4xl font-bold text-slate-950">My Properties</Text>
            <Text className="text-base text-slate-600">Manage the listings you created from Estately.</Text>
          </View>
          <Button label="Add Property" onPress={() => router.push('/(tabs)/property/new')} />
        </View>

        {propertiesQuery.isPending ? (
          <View className="items-center gap-3 rounded-xl border border-slate-200 bg-white p-6">
            <ActivityIndicator color="#16a34a" />
            <Text className="text-base text-slate-600">Loading your properties...</Text>
          </View>
        ) : null}

        {propertiesQuery.isError ? (
          <View className="gap-4 rounded-xl border border-red-200 bg-red-50 p-5">
            <Text className="text-center text-lg font-bold text-red-700">Unable to load your properties.</Text>
            <Button label="Try again" onPress={() => propertiesQuery.refetch()} variant="secondary" />
          </View>
        ) : null}

        {!propertiesQuery.isPending && !propertiesQuery.isError && properties.length === 0 ? (
          <View className="gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <Text className="text-center text-xl font-bold text-slate-950">No properties yet</Text>
            <Text className="text-center text-base text-slate-600">
              Create your first sale or rent listing from the mobile app.
            </Text>
            <Button label="Add Property" onPress={() => router.push('/(tabs)/property/new')} />
          </View>
        ) : null}

        <View className="gap-4">
          {properties.map((property) => (
            <MyPropertyCard key={property.id} property={property} />
          ))}
        </View>
      </View>
    </Screen>
  );
}
