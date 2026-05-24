'use client';

import { useLanguage } from '@/components/i18n/language-provider';

interface PropertySearchBarProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
}

export function PropertySearchBar({ className = '', value, onChange }: PropertySearchBarProps) {
  const { t } = useLanguage();

  return (
    <label className={`flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-charcoal-950 ${className}`}>
      {t('search')}
      <input
        type="search"
        name="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title, city, address..."
        className="h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-charcoal-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-estate-700 focus:ring-4 focus:ring-estate-700/10"
      />
    </label>
  );
}
