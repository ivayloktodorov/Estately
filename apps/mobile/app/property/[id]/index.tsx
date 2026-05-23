import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen scroll>
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">Property details</Text>
          <Text className="text-base text-slate-600">Listing #{id} details will be fetched from the REST API.</Text>
        </View>

        <View className="h-56 rounded-lg bg-slate-200" />
        <Button label="Contact about this property" />
      </View>
    </Screen>
  );
}
