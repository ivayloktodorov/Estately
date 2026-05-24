'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  createSavedSearch,
  deleteSavedSearch,
  savedSearchFromFormData,
  updateSavedSearch,
} from './service';

function savedSearchId(formData: FormData): number {
  const id = Number(formData.get('savedSearchId'));

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid saved search.');
  }

  return id;
}

export async function createSavedSearchAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  try {
    const input = savedSearchFromFormData(formData);

    await createSavedSearch(user.id, input);
    revalidatePath('/dashboard/saved-searches');
  } catch (error) {
    console.error('Saved search creation failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateSavedSearchAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  try {
    const input = savedSearchFromFormData(formData);

    await updateSavedSearch(user.id, savedSearchId(formData), input);
    revalidatePath('/dashboard/saved-searches');
  } catch (error) {
    console.error('Saved search update failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteSavedSearchAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  try {
    await deleteSavedSearch(user.id, savedSearchId(formData));
    revalidatePath('/dashboard/saved-searches');
  } catch (error) {
    console.error('Saved search deletion failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
