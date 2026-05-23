'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { properties, propertyMessages } from '@/src/db/schema';
import { requireAuth } from '@/lib/auth';
import type { InquiryActionState } from './types';

const minMessageLength = 10;
const maxMessageLength = 1000;

function messageFromForm(formData: FormData): string {
  const value = formData.get('message');
  return typeof value === 'string' ? value.trim() : '';
}

function validationState(message: string, error: string): InquiryActionState {
  return {
    status: 'error',
    message: 'Please fix the highlighted field.',
    fields: { message },
    errors: { message: error },
  };
}

export async function submitPropertyInquiryAction(
  propertyId: number,
  _prevState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const user = await requireAuth();
  const message = messageFromForm(formData);

  if (!message) {
    return validationState(message, 'Message is required.');
  }

  if (message.length < minMessageLength) {
    return validationState(message, 'Message must be at least 10 characters.');
  }

  if (message.length > maxMessageLength) {
    return validationState(message, 'Message must be 1000 characters or fewer.');
  }

  try {
    const property = await db
      .select({ id: properties.id, isPublished: properties.isPublished })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .then((rows) => rows[0]);

    if (!property || !property.isPublished) {
      return {
        status: 'error',
        message: 'This property is no longer available.',
        fields: { message },
      };
    }

    await db.insert(propertyMessages).values({
      propertyId,
      userId: user.id,
      message,
    });

    revalidatePath('/dashboard/inquiries');

    return {
      status: 'success',
      message: 'Your inquiry was sent.',
    };
  } catch (error) {
    console.error('Property inquiry submission error:', error);

    return {
      status: 'error',
      message: 'Unable to send your inquiry right now. Please try again.',
      fields: { message },
    };
  }
}
