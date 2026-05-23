import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { PropertyCard } from '@/components/property/property-card';
import { Button } from '@/components/ui/button';

export default function HomeScreen() {
  return (
    <Screen scroll>
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">Find your next home</Text>
          <Text className="text-base text-slate-600">Browse published Estately listings from the mobile API.</Text>
        </View>

        <Link href="/(tabs)/search" asChild>
          <Button label="Search properties" />
        </Link>

        <View className="gap-3">
          <Text className="text-lg font-semibold text-slate-950">Featured</Text>
          <PropertyCard />
        </View>
      </View>
    </Screen>
  );
}
