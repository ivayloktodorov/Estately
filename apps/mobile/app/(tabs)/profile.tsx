import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { useAuthSession, useLogout } from '@/hooks/use-auth';
import { t } from '@/lib/i18n';
import { getCurrentUser } from '@/services/auth.service';
import { ApiError } from '@/types/api';
import type { AuthUser } from '@/types/auth';

function initialsForUser(user: AuthUser): string {
  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('');

  return initials || user.email.slice(0, 1).toUpperCase();
}

function formatRole(role: string): string {
  const labels: Record<string, string> = {
    user: t('profile'),
    admin: t('adminDashboard'),
  };

  return labels[role] ?? role;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View className="gap-1 border-b border-slate-100 py-3 last:border-b-0">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text className="text-base font-semibold text-slate-950">{value}</Text>
    </View>
  );
}

interface QuickActionProps {
  label: string;
  description: string;
  onPress?: () => void;
}

function QuickAction({ label, description, onPress }: QuickActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-lg border border-slate-200 bg-white p-4 active:bg-slate-100"
      onPress={onPress}>
      <Text className="text-base font-bold text-slate-950">{label}</Text>
      <Text className="mt-1 text-sm leading-5 text-slate-600">{description}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const sessionQuery = useAuthSession();
  const logoutMutation = useLogout();
  const profileQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled: Boolean(sessionQuery.data?.token),
    retry: false,
  });

  useEffect(() => {
    if (!sessionQuery.isLoading && !sessionQuery.data?.token) {
      router.replace('/(auth)/login');
    }
  }, [sessionQuery.data?.token, sessionQuery.isLoading]);

  useEffect(() => {
    if (profileQuery.error instanceof ApiError && profileQuery.error.status === 401) {
      queryClient.setQueryData(['auth', 'session'], null);
      router.replace('/(auth)/login');
    }
  }, [profileQuery.error, queryClient]);

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    router.replace('/(auth)/login');
  }

  if (sessionQuery.isLoading || profileQuery.isPending) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color="#16a34a" />
          <Text className="text-base text-slate-600">{t('loadingProfile')}</Text>
        </View>
      </Screen>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Screen>
        <View className="flex-1 justify-center gap-5">
          <View className="gap-2">
            <Text className="text-center text-3xl font-bold text-slate-950">{t('unableToLoadProfile')}</Text>
            <Text className="text-center text-base text-slate-600">
              {t('profileRetryDescription')}
            </Text>
          </View>

          <Button label={t('tryAgain')} onPress={() => profileQuery.refetch()} variant="secondary" />
        </View>
      </Screen>
    );
  }

  const user = profileQuery.data;

  return (
    <Screen scroll>
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-4xl font-bold text-slate-950">{t('profile')}</Text>
          <Text className="text-base text-slate-600">{t('profileSubtitle')}</Text>
        </View>

        <View className="items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-50">
            <Text className="text-3xl font-bold text-brand-700">{initialsForUser(user)}</Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-center text-2xl font-bold text-slate-950">{user.fullName}</Text>
            <Text className="text-center text-base text-slate-600">{user.email}</Text>
          </View>
        </View>

        <View className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Text className="mb-2 text-xl font-bold text-slate-950">{t('accountInformation')}</Text>
          <InfoRow label={t('fullName')} value={user.fullName} />
          <InfoRow label={t('email')} value={user.email} />
          <InfoRow label={t('role')} value={formatRole(user.role)} />
        </View>

        <View className="gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Text className="text-xl font-bold text-slate-950">{t('accountStatus')}</Text>
          <View className="rounded-lg bg-brand-50 p-4">
            <Text className="text-base font-bold text-brand-700">{t('activeAccount')}</Text>
            <Text className="mt-1 text-sm leading-5 text-slate-700">
              {t('activeAccountDescription')}
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-xl font-bold text-slate-950">{t('quickActions')}</Text>
          <QuickAction
            description={t('myFavoritesDescription')}
            label={t('myFavorites')}
            onPress={() => router.push('/(tabs)/favorites')}
          />
          <QuickAction
            description={t('browsePropertiesDescription')}
            label={t('browseProperties')}
            onPress={() => router.push('/(tabs)/search')}
          />
          <QuickAction
            description={t('contactSupportDescription')}
            label={t('contactSupport')}
          />
        </View>

        <View className="gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Text className="text-xl font-bold text-slate-950">{t('logout')}</Text>
          <Text className="text-base leading-6 text-slate-600">
            {t('logoutDescription')}
          </Text>
          <Button
            disabled={logoutMutation.isPending}
            label={logoutMutation.isPending ? t('loggingOut') : t('logout')}
            onPress={() => {
              void handleLogout();
            }}
            variant="secondary"
          />
        </View>
      </View>
    </Screen>
  );
}
