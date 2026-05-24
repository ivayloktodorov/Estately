import { eq, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { properties } from '../src/db/schema';
import { requireDatabaseUrl } from './load-env';

const db = drizzle({
  connection: requireDatabaseUrl(),
  schema: { properties },
});

const MAX_PROPERTIES_TO_UPDATE = 300;

const imageUrlsByType: Record<string, string[]> = {
  apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop',
  ],
  house: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop',
  ],
  office: [
    'https://images.unsplash.com/photo-1497366216548-495531521910?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop',
  ],
  land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop',
  ],
};

const fallbackImageUrls = imageUrlsByType.house;

function imageForProperty(propertyType: string, id: number): string {
  const images = imageUrlsByType[propertyType] ?? fallbackImageUrls;
  return images[id % images.length];
}

async function seedPropertyImages() {
  const rows = await db
    .select({
      id: properties.id,
      propertyType: properties.propertyType,
    })
    .from(properties)
    .where(
      or(
        eq(properties.imageCoverUrl, ''),
        sql`lower(trim(${properties.imageCoverUrl})) in ('null', 'undefined', '/images/property-placeholder.jpg', '/images/property-placeholders/default.jpg')`,
      ),
    )
    .orderBy(properties.id)
    .limit(MAX_PROPERTIES_TO_UPDATE);

  let updatedCount = 0;

  for (const property of rows) {
    const imageCoverUrl = imageForProperty(property.propertyType, property.id);

    await db
      .update(properties)
      .set({ imageCoverUrl, updatedAt: new Date() })
      .where(eq(properties.id, property.id));

    updatedCount += 1;
  }

  console.log(`Updated ${updatedCount} properties with demo cover images.`);
}

seedPropertyImages().catch((error) => {
  console.error('Failed to seed property images:', error);
  process.exit(1);
});
