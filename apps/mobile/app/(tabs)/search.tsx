import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { PropertyCard } from '@/components/property/property-card';
import { TextField } from '@/components/ui/text-field';

export default function SearchScreen() {
  return (
    <Screen scroll>
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">Search</Text>
          <Text className="text-base text-slate-600">Filters and listing results will be connected here.</Text>
        </View>

        <TextField label="Location or keyword" placeholder="City, address, or keyword" />
        <PropertyCard />
      </View>
    </Screen>
  );
}
