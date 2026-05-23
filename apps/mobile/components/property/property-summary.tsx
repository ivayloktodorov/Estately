import { Text, View } from 'react-native';
import { formatPropertyLabel } from '@/components/property/property-format';
import type { PropertyDetails } from '@/types/property';

interface PropertySummaryProps {
  property: PropertyDetails;
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <View className="min-w-[46%] flex-1 rounded-lg border border-slate-200 bg-white p-4">
      <Text className="text-2xl font-bold text-slate-950">{value}</Text>
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
    </View>
  );
}

export function PropertySummary({ property }: PropertySummaryProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      <SummaryItem label="Bedrooms" value={String(property.bedrooms)} />
      <SummaryItem label="Bathrooms" value={String(property.bathrooms)} />
      <SummaryItem label="Square meters" value={String(property.areaSqm)} />
      <SummaryItem label="Type" value={formatPropertyLabel(property.propertyType)} />
    </View>
  );
}
