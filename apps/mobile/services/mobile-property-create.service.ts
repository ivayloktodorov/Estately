import { apiRequest } from '@/services/api';

export interface CreatePropertyImageInput {
  dataUrl: string;
  fileName?: string;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  price: string;
  city: string;
  address: string;
  propertyType: string;
  listingType: string;
  bedrooms: string;
  bathrooms: string;
  areaSqm: string;
  images?: CreatePropertyImageInput[];
}

export interface CreatePropertyResponse {
  id: number;
  title: string;
  status: string;
}

export function createMobileProperty(input: CreatePropertyInput): Promise<CreatePropertyResponse> {
  return apiRequest<CreatePropertyResponse, CreatePropertyInput>('/properties', {
    method: 'POST',
    body: input,
    requiresAuth: true,
  });
}
