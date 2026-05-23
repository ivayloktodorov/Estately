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
    return state('error', error instanceof Error ? error.message : 'Could not send message.');
  }

  revalidatePath('/dashboard/messages');
  revalidatePath(`/dashboard/messages/${conversationId}`);
  return state('success', 'Message sent.');
}
