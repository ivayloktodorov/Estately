import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { formatPrice, formatPropertyLabel } from '@/components/property/property-format';
import type { PropertyDetails } from '@/types/property';

interface PropertyDetailsInfoProps {
  property: PropertyDetails;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  onFavoritePress?: () => void;
}

export function PropertyDetailsInfo({
  property,
  isFavorite = false,
  isFavoriteLoading = false,
  onFavoritePress,
}: PropertyDetailsInfoProps) {
  return (
    <View className="gap-6">
      <View className="gap-2">
        <View className="flex-row flex-wrap gap-2">
          <Text className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            {formatPropertyLabel(property.listingType)}
          </Text>
          <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {formatPropertyLabel(property.propertyType)}
          </Text>
        </View>

        <View className="flex-row items-start gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-3xl font-bold text-slate-950">{formatPrice(property.price)}</Text>
            <Text className="text-2xl font-semibold text-slate-900">{property.title}</Text>
          </View>

          <Pressable
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white"
            disabled={isFavoriteLoading}
            onPress={onFavoritePress}>
            {isFavoriteLoading ? (
              <ActivityIndicator color="#16a34a" size="small" />
            ) : (
              <Ionicons
                color={isFavorite ? '#dc2626' : '#334155'}
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={26}
              />
            )}
          </Pressable>
        </View>
        <Text className="text-base text-slate-600">{property.address}</Text>
        <Text className="text-base font-medium text-slate-700">{property.city}</Text>
      </View>

      <View className="gap-2">
        <Text className="text-xl font-bold text-slate-950">Description</Text>
        <Text className="text-base leading-7 text-slate-700">{property.description}</Text>
      </View>
    </View>
  );
}
