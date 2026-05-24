'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
} from '@/lib/notifications/service';

function notificationId(formData: FormData): number {
  const id = Number(formData.get('notificationId'));

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid notification.');
  }

  return id;
}

function revalidateNotifications() {
  revalidatePath('/');
  revalidatePath('/dashboard/notifications');
}

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  try {
    await markNotificationAsRead(user.id, notificationId(formData));
    revalidateNotifications();
  } catch (error) {
    console.error('Notification read update failed', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function markNotificationUnreadAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  try {
    await markNotificationAsUnread(user.id, notificationId(formData));
    revalidateNotifications();
  } catch (error) {
    console.error('Notification unread update failed', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireAuth();

  try {
    await markAllNotificationsAsRead(user.id);
    revalidateNotifications();
  } catch (error) {
    console.error('Mark all notifications read failed', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteNotificationAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  try {
    await deleteNotification(user.id, notificationId(formData));
    revalidateNotifications();
  } catch (error) {
    console.error('Notification deletion failed', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
