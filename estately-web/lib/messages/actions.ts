'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { sendConversationMessage } from './service';

export interface MessageActionState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

function state(status: MessageActionState['status'], message: string): MessageActionState {
  return { status, message };
}

function messageErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Could not send message. Please try again.';
  }

  if (
    error.message === 'Message is required.' ||
    error.message === 'Message must be 2000 characters or fewer.' ||
    error.message === 'Attachment must be 10MB or smaller.' ||
    error.message === 'Only JPG, JPEG, PNG, WEBP, PDF, DOC, and DOCX files are allowed.' ||
    error.message === 'Conversation not found.'
  ) {
    return error.message;
  }

  if (error.message.includes('R2_') || error.message.includes('CLOUDFLARE_R2_')) {
    return 'Attachment uploads are not configured. Please try sending without an attachment.';
  }

  return 'Could not send message. Please try again.';
}

export async function sendMessageAction(
  _previousState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const user = await requireAuth();
  const conversationId = Number(formData.get('conversationId'));
  const body = String(formData.get('body') ?? '');
  const attachment = formData.get('attachment');

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return state('error', 'Invalid conversation.');
  }

  try {
    await sendConversationMessage({ conversationId, senderUserId: user.id, body, attachment });
  } catch (error) {
    console.error('Message send failed', {
      conversationId,
      userId: user.id,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return state('error', messageErrorMessage(error));
  }

  revalidatePath('/dashboard/messages');
  revalidatePath(`/dashboard/messages/${conversationId}`);
  return state('success', 'Message sent.');
}
