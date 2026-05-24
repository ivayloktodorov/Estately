'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { LOCALE_COOKIE, type Locale } from '@/lib/i18n/constants';
import bg from '@/locales/bg/common.json';
import en from '@/locales/en/common.json';

type Dictionary = typeof en;
type TranslationKey = keyof Dictionary;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const dictionaries: Record<Locale, Dictionary> = { en, bg };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale(nextLocale) {
      setLocaleState(nextLocale);
      localStorage.setItem(LOCALE_COOKIE, nextLocale);
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      window.location.reload();
    },
    t(key) {
      return dictionaries[locale][key] ?? dictionaries.en[key];
    },
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
