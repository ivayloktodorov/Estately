'use server';

import { revalidatePath } from 'next/cache';
import { eq, not } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';

export async function togglePropertyPublishedAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const propertyId = Number(formData.get('propertyId'));

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    throw new Error('Invalid property ID.');
  }

  await db
    .update(properties)
    .set({
      isPublished: not(properties.isPublished),
      updatedAt: new Date(),
    })
    .where(eq(properties.id, propertyId));

  revalidatePath('/admin/properties');
  revalidatePath(`/properties/${propertyId}`);
}

export async function deletePropertyAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const propertyId = Number(formData.get('propertyId'));

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    throw new Error('Invalid property ID.');
  }

  await db.delete(properties).where(eq(properties.id, propertyId));

  revalidatePath('/admin/properties');
  revalidatePath('/properties');
}
