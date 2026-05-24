import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { formatPrice, formatPropertyLabel } from '@/components/property/property-format';
import { t } from '@/lib/i18n';
import type { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  isFavorite?: boolean;
  isFavoriteLoading?: boolean;
  onFavoritePress?: () => void;
}

export function PropertyCard({
  property,
  onPress,
  isFavorite = false,
  isFavoriteLoading = false,
  onFavoritePress,
}: PropertyCardProps) {
  return (
    <View className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <View>
        <Pressable accessibilityRole="button" className="active:opacity-80" onPress={onPress}>
          {property.imageCoverUrl ? (
            <Image
              className="h-48 w-full bg-slate-200"
              resizeMode="cover"
              source={{ uri: property.imageCoverUrl }}
            />
          ) : (
            <View className="h-48 w-full items-center justify-center bg-slate-200">
              <Text className="text-sm font-medium text-slate-500">{t('noImage')}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          accessibilityLabel={isFavorite ? t('removeFromFavorites') : t('saveToFavorites')}
          accessibilityRole="button"
          className="absolute right-3 top-3 h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow"
          disabled={isFavoriteLoading}
          hitSlop={8}
          onPress={() => {
            onFavoritePress?.();
          }}>
          {isFavoriteLoading ? (
            <ActivityIndicator color="#16a34a" size="small" />
          ) : (
            <Ionicons
              color={isFavorite ? '#dc2626' : '#334155'}
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
            />
          )}
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" className="gap-3 p-4 active:opacity-80" onPress={onPress}>
        <View className="gap-1">
          <Text className="text-2xl font-bold text-slate-950">{formatPrice(property.price)}</Text>
          <Text className="text-lg font-semibold text-slate-900">{property.title}</Text>
          <Text className="text-sm text-slate-600">{property.address}</Text>
          <Text className="text-sm font-medium text-slate-700">{property.city}</Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {property.bedrooms} {t('bedShort')}
          </Text>
          <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {property.bathrooms} {t('bathShort')}
          </Text>
          <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {property.areaSqm} {t('sqmShort')}
          </Text>
          <Text className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            {formatPropertyLabel(property.listingType)}
          </Text>
          <Text className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            {formatPropertyLabel(property.propertyType)}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
