'use server';

import { revalidatePath } from 'next/cache';
import { eq, inArray } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { updatePropertyModeration, type ModerationStatus } from '@/lib/admin/properties';
import { notifyPropertyOwnersOfModeration } from '@/lib/notifications/service';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';

function propertyIdValue(formData: FormData): number {
  const propertyId = Number(formData.get('propertyId'));

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    throw new Error('Invalid property ID.');
  }

  return propertyId;
}

function selectedPropertyIds(formData: FormData): number[] {
  return formData
    .getAll('propertyIds')
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

function notesValue(formData: FormData): string | null {
  const value = formData.get('moderationNotes');
  const text = typeof value === 'string' ? value.trim() : '';
  return text.length > 0 ? text : null;
}

export async function moderatePropertyAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const propertyId = propertyIdValue(formData);
  const status = formData.get('status') === 'rejected' ? 'rejected' : 'approved';

  await updatePropertyModeration([propertyId], status, notesValue(formData));
  await notifyPropertyOwnersOfModeration([propertyId], status);

  revalidatePath('/admin/properties');
  revalidatePath(`/properties/${propertyId}`);
}

export async function deletePropertyAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const propertyId = propertyIdValue(formData);

  await db.delete(properties).where(eq(properties.id, propertyId));

  revalidatePath('/admin/properties');
  revalidatePath('/properties');
}

export async function bulkModeratePropertiesAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const propertyIds = selectedPropertyIds(formData);
  const action = formData.get('bulkAction');

  if (propertyIds.length === 0) {
    return;
  }

  if (action === 'delete') {
    await db.delete(properties).where(inArray(properties.id, propertyIds));
  } else {
    const status: ModerationStatus = action === 'reject' ? 'rejected' : 'approved';
    await updatePropertyModeration(propertyIds, status, notesValue(formData));
    await notifyPropertyOwnersOfModeration(propertyIds, status);
  }

  revalidatePath('/admin/properties');
  revalidatePath('/properties');
  for (const propertyId of propertyIds) {
    revalidatePath(`/properties/${propertyId}`);
  }
}
