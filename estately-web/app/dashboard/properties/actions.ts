'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { requireAuth } from '@/lib/auth';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema';
import { createPropertySchema } from '@/lib/properties/validation';
import { notifyPropertyOwnerOfAdminUpdate } from '@/lib/notifications/service';
import type { PropertyActionState } from '@/lib/properties/types';

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function propertyIdValue(formData: FormData): number {
  const propertyId = Number(formData.get('propertyId'));

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    throw new Error('Invalid property ID.');
  }

  return propertyId;
}

function propertyFields(formData: FormData): Record<string, string> {
  return {
    title: formValue(formData, 'title'),
    description: formValue(formData, 'description'),
    price: formValue(formData, 'price'),
    city: formValue(formData, 'city'),
    address: formValue(formData, 'address'),
    propertyType: formValue(formData, 'propertyType'),
    listingType: formValue(formData, 'listingType'),
    bedrooms: formValue(formData, 'bedrooms'),
    bathrooms: formValue(formData, 'bathrooms'),
    areaSqm: formValue(formData, 'areaSqm'),
  };
}

function validationErrorState(error: ZodError, fields: Record<string, string>): PropertyActionState {
  const errors: PropertyActionState['errors'] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === 'string') {
      errors[field] = issue.message;
    }
  }

  return {
    status: 'error',
    message: 'Please fix the highlighted fields.',
    fields,
    errors,
  };
}

export async function updatePropertyAction(
  _prevState: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const user = await requireAuth();
  const propertyId = propertyIdValue(formData);
  const fields = propertyFields(formData);
  const parsed = createPropertySchema.safeParse(fields);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  try {
    const validatedData = parsed.data;
    const whereClause =
      user.role === 'admin'
        ? eq(properties.id, propertyId)
        : and(eq(properties.id, propertyId), eq(properties.createdByUserId, user.id));

    const updatedRows = await db
      .update(properties)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price.toString(),
        city: validatedData.city,
        address: validatedData.address,
        propertyType: validatedData.propertyType,
        listingType: validatedData.listingType,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        areaSqm: validatedData.areaSqm,
        moderationStatus: user.role === 'admin' ? undefined : 'pending',
        moderationNotes: user.role === 'admin' ? undefined : null,
        isPublished: user.role === 'admin' ? undefined : false,
        updatedAt: new Date(),
      })
      .where(whereClause)
      .returning({ id: properties.id });

    if (!updatedRows[0]) {
      return {
        status: 'error',
        message: 'Property not found or you do not have permission to edit it.',
        fields,
      };
    }

    if (user.role === 'admin') {
      await notifyPropertyOwnerOfAdminUpdate(propertyId);
    }
  } catch (error) {
    console.error('Property update error:', error);
    return {
      status: 'error',
      message: 'Unable to update this property right now. Please try again.',
      fields,
    };
  }

  revalidatePath('/dashboard/properties');
  revalidatePath(`/properties/${propertyId}`);
  redirect('/dashboard/properties');
}

export async function deleteOwnPropertyAction(formData: FormData): Promise<void> {
  const user = await requireAuth();
  const propertyId = propertyIdValue(formData);

  await db
    .delete(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.createdByUserId, user.id)));

  revalidatePath('/dashboard/properties');
  revalidatePath('/properties');
}
