import { NextRequest } from 'next/server';
import { getMobilePaginatedProperties } from '@/lib/mobile-api/properties';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { mobilePropertyFiltersSchema, validationErrorMessage } from '@/lib/mobile-api/validation';

function searchParamsToRecord(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries(searchParams.entries());
}

export async function GET(request: NextRequest) {
  try {
    const filters = mobilePropertyFiltersSchema.parse(searchParamsToRecord(request.nextUrl.searchParams));
    const result = await getMobilePaginatedProperties(filters);

    return mobileSuccess(result);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400);
  }
}
