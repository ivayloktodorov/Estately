import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { markNotificationAsRead } from '@/lib/notifications/service';

interface NotificationReadRouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: NotificationReadRouteProps) {
  const user = await requireAuth();
  const { id } = await params;
  const notificationId = Number(id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return NextResponse.json(
      { status: 'error', error: { code: 'INVALID_NOTIFICATION_ID', message: 'Invalid notification ID.' } },
      { status: 400 },
    );
  }

  await markNotificationAsRead(user.id, notificationId);

  return NextResponse.json({ status: 'success', data: { id: notificationId, isRead: true } });
}
