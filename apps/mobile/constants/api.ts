import Constants from 'expo-constants';
import { Platform } from 'react-native';

const MOBILE_API_PATH = '/api/mobile';

function normalizeApiUrl(url: string): string {
  const trimmedUrl = url.trim().replace(/\/+$/, '');

  return trimmedUrl.endsWith(MOBILE_API_PATH) ? trimmedUrl : `${trimmedUrl}${MOBILE_API_PATH}`;
}

function getExpoHostApiUrl(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];

  return host ? `http://${host}:3000/api/mobile` : null;
}

function getDefaultApiUrl(): string {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return 'http://localhost:3000/api/mobile';
  }

  if (Platform.OS === 'android') {
    return getExpoHostApiUrl() ?? 'http://10.0.2.2:3000/api/mobile';
  }

  return getExpoHostApiUrl() ?? 'http://localhost:3000/api/mobile';
}

export const API_BASE_URL =
  normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl());
