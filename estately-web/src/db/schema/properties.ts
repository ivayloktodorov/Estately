import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  foreignKey,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const properties = pgTable(
  'properties',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(),
    city: varchar('city', { length: 255 }).notNull(),
    address: varchar('address', { length: 255 }).notNull(),
    propertyType: varchar('property_type', { length: 50 }).notNull(),
    listingType: varchar('listing_type', { length: 50 }).notNull().default('sale'),
    bedrooms: integer('bedrooms').notNull(),
    bathrooms: integer('bathrooms').notNull(),
    areaSqm: integer('area_sqm').notNull(),
    imageCoverUrl: text('image_cover_url').notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    createdByUserId: integer('created_by_user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('properties_city_idx').on(table.city),
    index('properties_property_type_idx').on(table.propertyType),
    index('properties_listing_type_idx').on(table.listingType),
    index('properties_price_idx').on(table.price),
    index('properties_bedrooms_idx').on(table.bedrooms),
    index('properties_bathrooms_idx').on(table.bathrooms),
    index('properties_is_published_idx').on(table.isPublished),
    foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
  ]
);
