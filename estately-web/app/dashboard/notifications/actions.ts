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

  await markNotificationAsRead(user.id, notificationId(formData));
  revalidateNotifications();
}

export async function markNotificationUnreadAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  await markNotificationAsUnread(user.id, notificationId(formData));
  revalidateNotifications();
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireAuth();

  await markAllNotificationsAsRead(user.id);
  revalidateNotifications();
}

export async function deleteNotificationAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  await deleteNotification(user.id, notificationId(formData));
  revalidateNotifications();
}
