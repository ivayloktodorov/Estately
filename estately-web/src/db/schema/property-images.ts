import { pgTable, serial, integer, text, foreignKey } from 'drizzle-orm/pg-core';
import { properties } from './properties';

export const propertyImages = pgTable(
  'property_images',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').notNull(),
    imageUrl: text('image_url').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.propertyId],
      foreignColumns: [properties.id],
    }).onDelete('cascade'),
  ]
);
