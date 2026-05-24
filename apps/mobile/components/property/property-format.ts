import { t } from '@/lib/i18n';

export function formatCurrencyEUR(value: string | number): string {
  const amount = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(price: string): string {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return price;
  }

  return formatCurrencyEUR(value);
}

export function formatPropertyLabel(value: string): string {
  const labels: Record<string, string> = {
    apartment: t('apartment'),
    house: t('house'),
    villa: t('villa'),
    office: t('office'),
    land: t('land'),
    sale: t('saleLabel'),
    rent: t('rentLabel'),
  };

  return labels[value] ?? value;
}
