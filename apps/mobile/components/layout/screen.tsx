import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
}

export function Screen({ children, scroll = false }: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScrollView contentContainerClassName="px-4 py-5 sm:px-5 sm:py-6">{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-4 py-5 sm:px-5 sm:py-6">{children}</View>
    </SafeAreaView>
  );
}
