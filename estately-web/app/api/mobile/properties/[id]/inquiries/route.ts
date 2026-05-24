import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/src/db/client';
import { properties, propertyMessages } from '@/src/db/schema';
import { getMobileAuthUser } from '@/lib/mobile-api/auth';
import { mobileError, mobileSuccess } from '@/lib/mobile-api/responses';
import { createActivity } from '@/lib/activity/service';
import { createOrReuseConversationAndMessage } from '@/lib/messages/service';
import { notifyPropertyOwnerOfInquiry } from '@/lib/notifications/service';
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
      .select({
        id: properties.id,
        title: properties.title,
        moderationStatus: properties.moderationStatus,
        isPublished: properties.isPublished,
        ownerUserId: properties.createdByUserId,
      })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .then((rows) => rows[0]);

    if (!property || property.moderationStatus !== 'approved' || !property.isPublished) {
      return mobileError('Property not found.', 404);
    }

    if (property.ownerUserId === user.id) {
      return mobileError('You cannot send an inquiry to your own property.', 400);
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
    await createOrReuseConversationAndMessage({
      propertyId,
      buyerUserId: user.id,
      ownerUserId: property.ownerUserId,
      senderUserId: user.id,
      body: message,
    });
    await createActivity({
      userId: property.ownerUserId,
      type: 'inquiry_received',
      title: 'Inquiry received',
      description: `You received an inquiry for "${property.title}".`,
      entityType: 'property',
      entityId: propertyId,
    });
    await notifyPropertyOwnerOfInquiry(propertyId);

    return mobileSuccess({ inquiry }, 201);
  } catch (error) {
    return mobileError(validationErrorMessage(error), 400);
  }
}
