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
  return value
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
