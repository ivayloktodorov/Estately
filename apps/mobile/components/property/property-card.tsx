import { Image, Pressable, Text, View } from 'react-native';
import type { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
}

function formatPrice(price: string): string {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return price;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function PropertyCard({ property, onPress }: PropertyCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white active:opacity-80"
      onPress={onPress}>
      {property.imageCoverUrl ? (
        <Image
          className="h-48 w-full bg-slate-200"
          resizeMode="cover"
          source={{ uri: property.imageCoverUrl }}
        />
      ) : (
        <View className="h-48 w-full items-center justify-center bg-slate-200">
          <Text className="text-sm font-medium text-slate-500">No image</Text>
        </View>
      )}

      <View className="gap-3 p-4">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-slate-950">{formatPrice(property.price)}</Text>
          <Text className="text-lg font-semibold text-slate-900">{property.title}</Text>
          <Text className="text-sm text-slate-600">{property.address}</Text>
          <Text className="text-sm font-medium text-slate-700">{property.city}</Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {property.bedrooms} bed
          </Text>
          <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {property.bathrooms} bath
          </Text>
          <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {property.areaSqm} sqm
          </Text>
          <Text className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            {formatLabel(property.listingType)}
          </Text>
          <Text className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            {formatLabel(property.propertyType)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
