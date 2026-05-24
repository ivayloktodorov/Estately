import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/use-auth';
import { t } from '@/lib/i18n';
import { sendPropertyInquiry } from '@/services/inquiry.service';
import { ApiError } from '@/types/api';

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 1000;

interface ContactAgentCardProps {
  propertyId: number;
}

function validateMessage(message: string): string | null {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return t('messageRequired');
  }

  if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
    return t('messageMinLength');
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return t('messageMaxLength');
  }

  return null;
}

export function ContactAgentCard({ propertyId }: ContactAgentCardProps) {
  const sessionQuery = useAuthSession();
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit() {
    const nextValidationError = validateMessage(message);

    setSuccessMessage(null);
    setSubmitError(null);
    setValidationError(nextValidationError);

    if (nextValidationError) {
      return;
    }

    setIsSending(true);

    try {
      await sendPropertyInquiry(propertyId, message.trim());
      setMessage('');
      setSuccessMessage(t('inquirySent'));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace('/(auth)/login');
        return;
      }

      setSubmitError(t('unableToSendInquiry'));
    } finally {
      setIsSending(false);
    }
  }

  if (!sessionQuery.data?.token) {
    return (
      <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <View className="gap-1">
          <Text className="text-xl font-bold text-slate-950">{t('contactAgent')}</Text>
          <Text className="text-base leading-6 text-slate-600">
            {t('loginToContactAgent')}
          </Text>
        </View>

        <Button label={t('login')} onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  return (
    <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <View className="gap-1">
        <Text className="text-xl font-bold text-slate-950">{t('contactAgent')}</Text>
        <Text className="text-base leading-6 text-slate-600">
          {t('contactAgentPrompt')}
        </Text>
      </View>

      <View className="gap-2">
        <TextInput
          className="min-h-32 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base leading-6 text-slate-900"
          editable={!isSending}
          maxLength={MAX_MESSAGE_LENGTH}
          multiline
          onChangeText={(value) => {
            setMessage(value);
            setValidationError(null);
            setSubmitError(null);
            setSuccessMessage(null);
          }}
          placeholder={t('writePropertyMessage')}
          placeholderTextColor="#94a3b8"
          textAlignVertical="top"
          value={message}
        />
        <Text className="text-right text-xs font-medium text-slate-500">
          {message.length}/{MAX_MESSAGE_LENGTH}
        </Text>
      </View>

      {validationError ? <Text className="text-sm font-medium text-red-600">{validationError}</Text> : null}
      {submitError ? <Text className="text-sm font-medium text-red-600">{submitError}</Text> : null}
      {successMessage ? <Text className="text-sm font-semibold text-brand-700">{successMessage}</Text> : null}

      <Button
        disabled={isSending}
        label={isSending ? t('sending') : t('sendInquiry')}
        onPress={() => {
          void handleSubmit();
        }}
      />
    </View>
  );
}
