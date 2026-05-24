import { boolean, foreignKey, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { properties } from './properties';

export const propertyImages = pgTable(
  'property_images',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').notNull(),
    imageUrl: text('image_url').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isCover: boolean('is_cover').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.propertyId],
      foreignColumns: [properties.id],
    }).onDelete('cascade'),
    index('property_images_property_id_idx').on(table.propertyId),
    index('property_images_property_sort_idx').on(table.propertyId, table.sortOrder),
    index('property_images_property_cover_idx').on(table.propertyId, table.isCover),
  ]
);
