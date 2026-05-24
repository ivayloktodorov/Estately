import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuthSession, useLogin } from '@/hooks/use-auth';
import { t } from '@/lib/i18n';
import { ApiError } from '@/types/api';

function validateLogin(email: string, password: string): string | null {
  if (!email.trim()) {
    return t('emailRequired');
  }

  if (!password) {
    return t('passwordRequired');
  }

  return null;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useLogin();
  const { data: session } = useAuthSession();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/profile');
    }
  }, [session]);

  async function handleSubmit() {
    const validationError = validateLogin(email, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });
      router.replace('/(tabs)/profile');
    } catch (mutationError) {
      setError(mutationError instanceof ApiError ? mutationError.message : t('unableToLogin'));
    }
  }

  const isSubmitting = loginMutation.isPending;

  return (
    <Screen>
      <View className="flex-1 justify-center gap-8">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">{t('welcomeBack')}</Text>
          <Text className="text-base text-slate-600">{t('loginSubtitle')}</Text>
        </View>

        <View className="gap-4">
          <TextField
            label={t('email')}
            autoCapitalize="none"
            autoComplete="email"
            editable={!isSubmitting}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder={t('emailPlaceholder')}
            value={email}
          />
          <TextField
            label={t('password')}
            editable={!isSubmitting}
            onChangeText={setPassword}
            onSubmitEditing={handleSubmit}
            placeholder={t('password')}
            secureTextEntry
            value={password}
          />
          {error ? <Text className="text-sm font-medium text-red-600">{error}</Text> : null}
          <Button disabled={isSubmitting} label={isSubmitting ? t('loggingIn') : t('logIn')} onPress={handleSubmit} />
        </View>

        <Link href="/(auth)/register" className="text-center text-base font-semibold text-brand-700">
          {t('createAccount')}
        </Link>
      </View>
    </Screen>
  );
}
