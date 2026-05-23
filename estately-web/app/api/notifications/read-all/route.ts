import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { markAllNotificationsAsRead } from '@/lib/notifications/service';

export async function POST() {
  const user = await requireAuth();

  await markAllNotificationsAsRead(user.id);

  return NextResponse.json({ status: 'success', data: { isRead: true } });
}
