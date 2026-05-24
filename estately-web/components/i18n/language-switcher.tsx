'use client';

import { useLanguage } from './language-provider';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div aria-label="Language" className="inline-flex h-10 items-center rounded-md border border-stone-200 bg-white p-1 text-xs font-bold text-stone-600 shadow-sm">
      {(['en', 'bg'] as const).map((option) => (
        <button
          className={`h-8 rounded px-2.5 transition ${
            locale === option ? 'bg-estate-700 text-white' : 'hover:bg-cream-50 hover:text-estate-700'
          }`}
          key={option}
          onClick={() => setLocale(option)}
          type="button"
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
