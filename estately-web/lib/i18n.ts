import bg from '@/locales/bg/common.json';
import en from '@/locales/en/common.json';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/constants';

export type TranslationKey = keyof typeof en;

const dictionaries: Record<Locale, typeof en> = { en, bg };

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'bg';
}

export async function getLocale(): Promise<Locale> {
  return DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): typeof en {
  return dictionaries[locale];
}

export async function getTranslations(): Promise<typeof en> {
  return getDictionary(await getLocale());
}
