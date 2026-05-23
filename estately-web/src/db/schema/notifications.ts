import { boolean, foreignKey, index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationTypes = [
  'listing_pending',
  'listing_approved',
  'listing_rejected',
  'listing_updated',
  'inquiry_received',
  'message_received',
  'system',
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: integer('entity_id'),
    href: text('href'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_user_is_read_idx').on(table.userId, table.isRead),
    index('notifications_created_at_idx').on(table.createdAt),
    index('notifications_type_idx').on(table.type),
  ],
);
