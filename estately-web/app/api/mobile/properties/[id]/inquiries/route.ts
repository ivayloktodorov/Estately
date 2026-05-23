import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/src/db/client';
import { properties, propertyMessages } from '@/src/db/schema';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import {
  mobileInquirySchema,
  mobilePropertyIdSchema,
  validationErrorMessage,
} from '@/lib/mobile-api/validation';

interface MobilePropertyInquiryRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: MobilePropertyInquiryRouteProps) {
  const user = await getMobileAuthUser(request);

  if (!user) {
    return mobileError('Authentication required.', 401);
  }

  try {
    const { id } = await params;
    const propertyId = mobilePropertyIdSchema.parse(id);
    const { message } = mobileInquirySchema.parse(await request.json());
    const property = await db
      .select({ id: properties.id, isPublished: properties.isPublished })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .then((rows) => rows[0]);

    if (!property || !property.isPublished) {
      return mobileError('Property not found.', 404);
    }

    const [inquiry] = await db
      .insert(propertyMessages)
      .values({
        propertyId,
        userId: user.id,
        message,
      })
      .returning({
        id: propertyMessages.id,
        propertyId: propertyMessages.propertyId,
        userId: propertyMessages.userId,
        message: propertyMessages.message,
        createdAt: propertyMessages.createdAt,
      });

    return mobileSuccess({ inquiry }, 201);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400);
  }
}
