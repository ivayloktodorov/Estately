import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUnreadNotificationCount, getUserNotifications } from '@/lib/notifications/service';

export async function GET() {
  const user = await requireAuth();
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  return NextResponse.json({
    status: 'success',
    data: { notifications, unreadCount },
  });
}
