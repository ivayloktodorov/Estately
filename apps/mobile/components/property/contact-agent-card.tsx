import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/use-auth';
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
    return 'Message is required.';
  }

  if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
    return 'Message must be at least 10 characters.';
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return 'Message must be 1000 characters or fewer.';
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
      setSuccessMessage('Your inquiry was sent successfully.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace('/(auth)/login');
        return;
      }

      setSubmitError('Unable to send inquiry. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  if (!sessionQuery.data?.token) {
    return (
      <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <View className="gap-1">
          <Text className="text-xl font-bold text-slate-950">Contact agent</Text>
          <Text className="text-base leading-6 text-slate-600">
            Login to contact agent and send a message about this property.
          </Text>
        </View>

        <Button label="Login" onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  return (
    <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <View className="gap-1">
        <Text className="text-xl font-bold text-slate-950">Contact agent</Text>
        <Text className="text-base leading-6 text-slate-600">
          Send a quick note to ask about availability, viewings, or details that matter to you.
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
          placeholder="Write your message about this property..."
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
        label={isSending ? 'Sending...' : 'Send inquiry'}
        onPress={() => {
          void handleSubmit();
        }}
      />
    </View>
  );
}
