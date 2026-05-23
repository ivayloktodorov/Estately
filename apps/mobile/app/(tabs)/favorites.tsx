import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';

export default function FavoritesScreen() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-5">
        <View className="gap-2">
          <Text className="text-center text-3xl font-bold text-slate-950">Saved homes</Text>
          <Text className="text-center text-base text-slate-600">Favorited properties will appear here.</Text>
        </View>

        <Link href="/(tabs)/search" asChild>
          <Button label="Browse listings" variant="secondary" />
        </Link>
      </View>
    </Screen>
  );
}
