import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuthSession, useRegister } from '@/hooks/use-auth';
import { t } from '@/lib/i18n';
import { ApiError } from '@/types/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(fullName: string, email: string, password: string): string | null {
  if (!fullName.trim()) {
    return t('fullNameRequired');
  }

  if (!emailPattern.test(email.trim())) {
    return t('validEmailRequired');
  }

  if (password.length < 6) {
    return t('passwordMinLength');
  }

  return null;
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useRegister();
  const { data: session } = useAuthSession();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/profile');
    }
  }, [session]);

  async function handleSubmit() {
    const validationError = validateRegister(fullName, email, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      router.replace('/(tabs)/profile');
    } catch (mutationError) {
      setError(mutationError instanceof ApiError ? mutationError.message : t('unableToRegister'));
    }
  }

  const isSubmitting = registerMutation.isPending;

  return (
    <Screen>
      <View className="flex-1 justify-center gap-8">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">{t('createAccountTitle')}</Text>
          <Text className="text-base text-slate-600">{t('registerSubtitle')}</Text>
        </View>

        <View className="gap-4">
          <TextField
            label={t('fullName')}
            autoComplete="name"
            editable={!isSubmitting}
            onChangeText={setFullName}
            placeholder={t('fullNamePlaceholder')}
            value={fullName}
          />
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
          <Button disabled={isSubmitting} label={isSubmitting ? t('registering') : t('register')} onPress={handleSubmit} />
        </View>

        <Link href="/(auth)/login" className="text-center text-base font-semibold text-brand-700">
          {t('alreadyHaveAccount')}
        </Link>
      </View>
    </Screen>
  );
}
