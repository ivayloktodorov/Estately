import { NextRequest } from 'next/server';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { getMobilePropertyDetails } from '@/lib/mobile-api/properties';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { mobilePropertyIdSchema, validationErrorMessage } from '@/lib/mobile-api/validation';
import { canViewProperty } from '@/lib/properties/visibility';

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

    if (!canViewProperty(property, null)) {
      const user = await getMobileAuthUser(request);

      if (!canViewProperty(property, user)) {
        return mobileError('Property not found.', 404);
      }
    }

    return mobileSuccess(property);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400);
  }
}
