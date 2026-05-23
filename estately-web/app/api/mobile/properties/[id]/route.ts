import { NextRequest } from 'next/server';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { getMobilePropertyDetails } from '@/lib/mobile-api/properties';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { mobilePropertyIdSchema, validationErrorMessage } from '@/lib/mobile-api/validation';

interface MobilePropertyRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: MobilePropertyRouteProps) {
  try {
    const { id } = await params;
    const propertyId = mobilePropertyIdSchema.parse(id);
    const property = await getMobilePropertyDetails(propertyId);

    if (!property) {
      return mobileError('Property not found.', 404);
    }

    if (!property.isPublished) {
      const user = await getMobileAuthUser(request);
      const canView = user?.role === 'admin' || user?.id === property.createdByUserId;

      if (!canView) {
        return mobileError('Property not found.', 404);
      }
    }

    return mobileSuccess(property);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400);
  }
}
