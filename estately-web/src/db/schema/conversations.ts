import { foreignKey, index, integer, pgTable, serial, timestamp, unique } from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { users } from './users';

export const conversations = pgTable(
  'conversations',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').notNull(),
    buyerUserId: integer('buyer_user_id').notNull(),
    ownerUserId: integer('owner_user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.propertyId],
      foreignColumns: [properties.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.buyerUserId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ownerUserId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    unique('unique_property_buyer_owner_conversation').on(table.propertyId, table.buyerUserId, table.ownerUserId),
    index('conversations_property_id_idx').on(table.propertyId),
    index('conversations_buyer_user_id_idx').on(table.buyerUserId),
    index('conversations_owner_user_id_idx').on(table.ownerUserId),
    index('conversations_updated_at_idx').on(table.updatedAt),
  ],
);
