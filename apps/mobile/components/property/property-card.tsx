import { Text, View } from 'react-native';
import type { Property } from '@/types/property';

interface PropertyCardProps {
  property?: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <View className="gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <Text className="text-lg font-semibold text-slate-950">
        {property?.title ?? 'Featured property'}
      </Text>
      <Text className="text-sm text-slate-600">
        {property ? `${property.city} · ${property.bedrooms} bed · ${property.bathrooms} bath` : 'Listing data will appear here.'}
      </Text>
    </View>
  );
}
