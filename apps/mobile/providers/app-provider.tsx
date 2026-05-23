import { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppQueryProvider } from '@/providers/query-provider';

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AppQueryProvider>{children}</AppQueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
