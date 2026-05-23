import { foreignKey, index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userActivityTypes = [
  'property_created',
  'property_updated',
  'property_approved',
  'property_rejected',
  'property_deleted',
  'inquiry_received',
  'message_received',
  'favorite_added',
  'profile_updated',
] as const;

export type UserActivityType = (typeof userActivityTypes)[number];

export const userActivity = pgTable(
  'user_activity',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: integer('entity_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    index('user_activity_user_id_idx').on(table.userId),
    index('user_activity_user_created_at_idx').on(table.userId, table.createdAt),
    index('user_activity_type_idx').on(table.type),
  ],
);
