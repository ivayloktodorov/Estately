'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { deleteAdminAttachment, deleteAdminMessage } from '@/lib/admin/messages';

function positiveId(formData: FormData, field: string): number {
  const value = Number(formData.get(field));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${field}.`);
  }

  return value;
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAdmin();

  try {
    const messageId = positiveId(formData, 'messageId');
    const conversationId = await deleteAdminMessage(messageId);

    revalidatePath('/admin/messages');

    if (conversationId) {
      revalidatePath(`/admin/messages/${conversationId}`);
    }
  } catch (error) {
    console.error('Admin message deletion failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteAttachmentAction(formData: FormData): Promise<void> {
  await requireAdmin();

  try {
    const attachmentId = positiveId(formData, 'attachmentId');
    const conversationId = await deleteAdminAttachment(attachmentId);

    revalidatePath('/admin/messages');

    if (conversationId) {
      revalidatePath(`/admin/messages/${conversationId}`);
    }
  } catch (error) {
    console.error('Admin attachment deletion failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
