'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './service';

export async function getCurrentUserNotificationsAction() {
  const user = await requireAuth();
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  return { notifications, unreadCount };
}

export async function markNotificationAsReadAction(notificationId: number) {
  const user = await requireAuth();

  await markNotificationAsRead(user.id, notificationId);
  revalidatePath('/');

  return getCurrentUserNotificationsAction();
}

export async function markAllNotificationsAsReadAction() {
  const user = await requireAuth();

  await markAllNotificationsAsRead(user.id);
  revalidatePath('/');

  return getCurrentUserNotificationsAction();
}
