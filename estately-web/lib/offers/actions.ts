'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { OfferSubmissionError, submitPropertyOffer, updateOfferStatus } from './service';
import type { OfferActionState } from './types';

const maxOfferMessageLength = 1000;

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseOfferAmount(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.');

  return Number(normalized);
}

function errorState(
  message: string,
  fields: OfferActionState['fields'],
  errors?: OfferActionState['errors'],
): OfferActionState {
  return { status: 'error', message, fields, errors };
}

export async function submitPropertyOfferAction(
  propertyId: number,
  _prevState: OfferActionState,
  formData: FormData,
): Promise<OfferActionState> {
  const user = await requireAuth();
  const fields = {
    amount: textValue(formData, 'amount'),
    message: textValue(formData, 'message'),
  };
  const amount = parseOfferAmount(fields.amount);

  if (!fields.amount) {
    return errorState('Please fix the highlighted field.', fields, { amount: 'Offer amount is required.' });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return errorState('Please fix the highlighted field.', fields, { amount: 'Offer amount must be a positive number.' });
  }

  if (fields.message.length > maxOfferMessageLength) {
    return errorState('Please fix the highlighted field.', fields, { message: 'Message must be 1000 characters or fewer.' });
  }

  try {
    await submitPropertyOffer({
      propertyId,
      buyerUserId: user.id,
      amount: amount.toFixed(2),
      message: fields.message || null,
    });

    revalidatePath(`/property/${propertyId}`);
    revalidatePath('/dashboard/offers');
    revalidatePath('/dashboard/messages');

    return {
      status: 'success',
      message: 'Your offer was submitted.',
    };
  } catch (error) {
    console.error('Property offer submission error:', error);
    const message =
      error instanceof OfferSubmissionError
        ? error.message
        : 'Unable to submit your offer right now. Please try again.';

    return errorState(message, fields);
  }
}

export async function updatePropertyOfferStatusAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  try {
    const offerId = Number(textValue(formData, 'offerId'));
    const status = textValue(formData, 'status');

    if (!Number.isInteger(offerId) || offerId <= 0 || (status !== 'accepted' && status !== 'rejected')) {
      throw new Error('Invalid offer action.');
    }

    await updateOfferStatus({ offerId, ownerUserId: user.id, status });
    revalidatePath('/dashboard/offers');
  } catch (error) {
    console.error('Offer status update failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
