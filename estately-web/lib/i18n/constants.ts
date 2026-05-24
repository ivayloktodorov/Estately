export const LOCALES = ['en', 'bg'] as const;
export const DEFAULT_LOCALE = 'en';
export const LOCALE_COOKIE = 'estately_locale';

export type Locale = (typeof LOCALES)[number];

