import { apiRequest } from '@/services/api';

export interface PropertyInquiry {
  id: number;
  propertyId: number;
  userId: number;
  message: string;
  createdAt: string;
}

interface SendPropertyInquiryResponse {
  inquiry: PropertyInquiry;
}

export function sendPropertyInquiry(
  propertyId: number,
  message: string,
): Promise<SendPropertyInquiryResponse> {
  return apiRequest<SendPropertyInquiryResponse, { message: string }>(
    `/properties/${propertyId}/inquiries`,
    {
      method: 'POST',
      body: { message },
      requiresAuth: true,
    },
  );
}
