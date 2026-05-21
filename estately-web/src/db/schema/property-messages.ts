import { pgTable, serial, integer, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { properties } from './properties';

export const propertyMessages = pgTable(
  'property_messages',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').notNull(),
    userId: integer('user_id').notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.propertyId],
      foreignColumns: [properties.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
  ]
);
