import { decimal, foreignKey, index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { users } from './users';

export const propertyOfferStatuses = ['pending', 'accepted', 'rejected'] as const;

export type PropertyOfferStatus = (typeof propertyOfferStatuses)[number];

export const propertyOffers = pgTable(
  'property_offers',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').notNull(),
    buyerUserId: integer('buyer_user_id').notNull(),
    ownerUserId: integer('owner_user_id').notNull(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    message: text('message'),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
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
    index('property_offers_property_id_idx').on(table.propertyId),
    index('property_offers_buyer_user_id_idx').on(table.buyerUserId),
    index('property_offers_owner_user_id_idx').on(table.ownerUserId),
    index('property_offers_status_idx').on(table.status),
    index('property_offers_created_at_idx').on(table.createdAt),
  ],
);
