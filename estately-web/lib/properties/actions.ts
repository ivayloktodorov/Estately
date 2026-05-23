'use server';

import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { db } from '@/src/db/client';
import { properties } from '@/src/db/schema/properties';
import { requireAuth } from '@/lib/auth';
import { createPropertySchema } from './validation';
import type { PropertyActionState } from './types';

const genericError = 'Something went wrong. Please try again.';
const defaultCoverImageUrl =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop';

function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
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

export async function createPropertyAction(
  _prevState: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  const user = await requireAuth();

  const fields = {
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

  const parsed = createPropertySchema.safeParse(fields);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  let propertyId: number | undefined;

  try {
    const validatedData = parsed.data;

    const result = await db
      .insert(properties)
      .values({
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
        imageCoverUrl: defaultCoverImageUrl,
        createdByUserId: user.id,
        isPublished: false,
        moderationStatus: 'pending',
        moderationNotes: null,
        updatedAt: new Date(),
      })
      .returning({ id: properties.id });

    propertyId = result[0]?.id;
  } catch (error) {
    console.error('Property creation error:', error);
    return {
      status: 'error',
      message: 'Unable to create this property right now. Please try again.',
      fields,
    };
  }

  if (!propertyId) {
    return { status: 'error', message: genericError, fields };
  }

  redirect(`/properties/${propertyId}`);
}
