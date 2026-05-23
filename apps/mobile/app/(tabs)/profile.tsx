import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { useAuthSession, useLogout } from '@/hooks/use-auth';

export default function ProfileScreen() {
  const { data: session } = useAuthSession();
  const logoutMutation = useLogout();

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    router.replace('/(auth)/login');
  }

  if (session) {
    return (
      <Screen>
        <View className="flex-1 justify-between gap-6">
          <View className="gap-5">
            <View className="gap-2">
              <Text className="text-3xl font-bold text-slate-950">Profile</Text>
              <Text className="text-base text-slate-600">You are signed in to Estately.</Text>
            </View>

            <View className="gap-2 rounded-lg border border-slate-200 bg-white p-4">
              <Text className="text-lg font-semibold text-slate-950">{session.user.fullName}</Text>
              <Text className="text-base text-slate-600">{session.user.email}</Text>
              <Text className="text-sm font-medium uppercase text-slate-500">{session.user.role}</Text>
            </View>
          </View>

          <Button
            disabled={logoutMutation.isPending}
            label={logoutMutation.isPending ? 'Logging out...' : 'Log out'}
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 justify-between gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">Profile</Text>
          <Text className="text-base text-slate-600">Log in to save listings and manage your account.</Text>
        </View>

        <View className="gap-3">
          <Button label="Log in" onPress={() => router.push('/(auth)/login')} />
          <Button
            label="Create account"
            onPress={() => router.push('/(auth)/register')}
            variant="secondary"
          />
        </View>
      </View>
    </Screen>
  );
}
