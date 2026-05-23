import { and, count, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/src/db/client';
import { notifications, properties, users, type NotificationType } from '@/src/db/schema';

export type { NotificationType };

export interface NotificationListItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: number | null;
  href: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
  href?: string;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function notificationType(type: string): NotificationType {
  switch (type) {
    case 'listing_pending':
    case 'listing_approved':
    case 'listing_rejected':
    case 'listing_updated':
    case 'inquiry_received':
    case 'message_received':
    case 'system':
      return type;
    default:
      return 'system';
  }
}

function toListItem(row: typeof notifications.$inferSelect): NotificationListItem {
  return {
    id: row.id,
    type: notificationType(row.type),
    title: row.title,
    message: row.message,
    entityType: row.entityType,
    entityId: row.entityId,
    href: row.href,
    isRead: row.isRead,
    createdAt: row.createdAt,
  };
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    entityType: input.entityType,
    entityId: input.entityId,
    href: input.href,
  });
}

export async function createNotifications(inputs: CreateNotificationInput[]): Promise<void> {
  if (inputs.length === 0) {
    return;
  }

  await db.insert(notifications).values(
    inputs.map((input) => ({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType,
      entityId: input.entityId,
      href: input.href,
    })),
  );
}

export async function getUserNotifications(userId: number, limit = DEFAULT_LIMIT): Promise<NotificationListItem[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(Math.min(Math.max(limit, 1), MAX_LIMIT));

  return rows.map(toListItem);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return rows[0]?.value ?? 0;
}

export async function markNotificationAsRead(userId: number, notificationId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

export async function notifyAdminsOfPendingListing(propertyId: number, propertyTitle: string): Promise<void> {
  const adminRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'admin'));

  await createNotifications(
    adminRows.map((admin) => ({
      userId: admin.id,
      type: 'listing_pending',
      title: 'New listing pending approval',
      message: `Property "${propertyTitle}" requires review.`,
      entityType: 'property',
      entityId: propertyId,
      href: '/admin/properties',
    })),
  );
}

export async function notifyPropertyOwnersOfModeration(
  propertyIds: number[],
  status: 'approved' | 'rejected',
): Promise<void> {
  if (propertyIds.length === 0) {
    return;
  }

  const rows = await db
    .select({
      id: properties.id,
      title: properties.title,
      ownerId: properties.createdByUserId,
    })
    .from(properties)
    .where(inArray(properties.id, propertyIds));

  await createNotifications(
    rows.map((property) => ({
      userId: property.ownerId,
      type: status === 'approved' ? 'listing_approved' : 'listing_rejected',
      title: status === 'approved' ? 'Your listing was approved' : 'Your listing was rejected',
      message:
        status === 'approved'
          ? `Your property "${property.title}" is now visible publicly.`
          : `Your property "${property.title}" was rejected and is hidden from public pages.`,
      entityType: 'property',
      entityId: property.id,
      href: '/dashboard/properties',
    })),
  );
}

export async function notifyPropertyOwnerOfAdminUpdate(propertyId: number): Promise<void> {
  const property = await db
    .select({
      id: properties.id,
      title: properties.title,
      ownerId: properties.createdByUserId,
    })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((rows) => rows[0]);

  if (!property) {
    return;
  }

  await createNotification({
    userId: property.ownerId,
    type: 'listing_updated',
    title: 'Your listing was updated',
    message: `An administrator updated your property "${property.title}".`,
    entityType: 'property',
    entityId: property.id,
    href: '/dashboard/properties',
  });
}

export async function notifyPropertyOwnerOfInquiry(propertyId: number): Promise<void> {
  const property = await db
    .select({
      id: properties.id,
      title: properties.title,
      ownerId: properties.createdByUserId,
    })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .then((rows) => rows[0]);

  if (!property) {
    return;
  }

  await createNotification({
    userId: property.ownerId,
    type: 'inquiry_received',
    title: 'New inquiry received',
    message: `Someone contacted you about "${property.title}".`,
    entityType: 'property',
    entityId: property.id,
    href: '/dashboard/inquiries',
  });
}
