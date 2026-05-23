import { pgTable, serial, integer, timestamp, foreignKey, unique, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { properties } from './properties';

export const favorites = pgTable(
  'favorites',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    propertyId: integer('property_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.propertyId],
      foreignColumns: [properties.id],
    }).onDelete('cascade'),
    unique('unique_user_property_favorite').on(table.userId, table.propertyId),
    index('favorites_property_id_idx').on(table.propertyId),
    index('favorites_created_at_idx').on(table.createdAt),
  ]
);
