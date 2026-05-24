import { Text, View } from 'react-native';
import { API_BASE_URL } from '@/constants/api';
import { t } from '@/lib/i18n';
import { ApiError } from '@/types/api';
import { Button } from './button';

interface ApiErrorStateProps {
  error: unknown;
  message: string;
  onRetry: () => void;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return `${error.status || 'Network'}: ${error.message}`;
  }

  return error instanceof Error ? error.message : 'Unknown error';
}

export function ApiErrorState({ error, message, onRetry }: ApiErrorStateProps) {
  return (
    <View className="gap-4">
      <Text className="text-center text-base font-medium text-red-600">{message}</Text>
      {__DEV__ ? (
        <View className="rounded-lg border border-red-100 bg-red-50 p-3">
          <Text className="text-xs font-semibold text-red-700">API: {API_BASE_URL}</Text>
          <Text className="mt-1 text-xs text-red-700">{errorMessage(error)}</Text>
        </View>
      ) : null}
      <Button label={t('tryAgain')} onPress={onRetry} variant="secondary" />
    </View>
  );
}
