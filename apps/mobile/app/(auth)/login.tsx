import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuthSession, useLogin } from '@/hooks/use-auth';
import { ApiError } from '@/types/api';

function validateLogin(email: string, password: string): string | null {
  if (!email.trim()) {
    return 'Email is required.';
  }

  if (!password) {
    return 'Password is required.';
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
      setError(mutationError instanceof ApiError ? mutationError.message : 'Unable to log in. Please try again.');
    }
  }

  const isSubmitting = loginMutation.isPending;

  return (
    <Screen>
      <View className="flex-1 justify-center gap-8">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">Welcome back</Text>
          <Text className="text-base text-slate-600">Sign in to save listings and contact owners.</Text>
        </View>

        <View className="gap-4">
          <TextField
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isSubmitting}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <TextField
            label="Password"
            editable={!isSubmitting}
            onChangeText={setPassword}
            onSubmitEditing={handleSubmit}
            placeholder="Password"
            secureTextEntry
            value={password}
          />
          {error ? <Text className="text-sm font-medium text-red-600">{error}</Text> : null}
          <Button disabled={isSubmitting} label={isSubmitting ? 'Logging in...' : 'Log in'} onPress={handleSubmit} />
        </View>

        <Link href="/(auth)/register" className="text-center text-base font-semibold text-brand-700">
          Create an account
        </Link>
      </View>
    </Screen>
  );
}
