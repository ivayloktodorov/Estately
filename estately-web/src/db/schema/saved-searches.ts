import { foreignKey, index, integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const savedSearches = pgTable(
  'saved_searches',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    city: varchar('city', { length: 255 }),
    propertyType: varchar('property_type', { length: 50 }),
    listingType: varchar('listing_type', { length: 50 }),
    minPrice: integer('min_price'),
    maxPrice: integer('max_price'),
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    index('saved_searches_user_id_idx').on(table.userId),
    index('saved_searches_city_idx').on(table.city),
    index('saved_searches_property_type_idx').on(table.propertyType),
    index('saved_searches_listing_type_idx').on(table.listingType),
    index('saved_searches_created_at_idx').on(table.createdAt),
  ],
);
