import { redirect } from 'next/navigation';
import type { PropertySearchParams } from '@/lib/properties/search';

interface BuyPageProps {
  searchParams?: Promise<PropertySearchParams>;
}

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const params = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    const paramValue = Array.isArray(value) ? value[0] : value;

    if (paramValue) {
      params.set(key, paramValue);
    }
  });

  const query = params.toString();
  redirect(query ? `/sale?${query}` : '/sale');
}
