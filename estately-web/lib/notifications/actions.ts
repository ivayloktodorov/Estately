'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
} from './service';

export async function getCurrentUserNotificationsAction() {
  const user = await requireAuth();
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id, 5),
    getUnreadNotificationCount(user.id),
  ]);

  return { notifications, unreadCount };
}

export async function markNotificationAsReadAction(notificationId: number) {
  const user = await requireAuth();

  await markNotificationAsRead(user.id, notificationId);
  revalidatePath('/');
  revalidatePath('/dashboard/notifications');

  return getCurrentUserNotificationsAction();
}

export async function markNotificationAsUnreadAction(notificationId: number) {
  const user = await requireAuth();

  await markNotificationAsUnread(user.id, notificationId);
  revalidatePath('/');
  revalidatePath('/dashboard/notifications');

  return getCurrentUserNotificationsAction();
}

export async function markAllNotificationsAsReadAction() {
  const user = await requireAuth();

  await markAllNotificationsAsRead(user.id);
  revalidatePath('/');
  revalidatePath('/dashboard/notifications');

  return getCurrentUserNotificationsAction();
}
