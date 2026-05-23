import bcrypt from 'bcryptjs';
import { count, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  cities,
  favorites,
  properties,
  propertyImages,
  propertyMessages,
  users,
} from '../src/db/schema';
import { requireDatabaseUrl } from './load-env';

const db = drizzle({
  connection: requireDatabaseUrl(),
  schema: { cities, favorites, properties, propertyImages, propertyMessages, users },
});

const TARGET_USERS = 10_000;
const TARGET_PROPERTIES = 10_000;
const TARGET_FAVORITES = 10_000;
const TARGET_MESSAGES = 10_000;
const TARGET_IMAGES = 10_000;
const BATCH_SIZE = 500;
const LOAD_TEST_PREFIX = 'loadtest';
const PASSWORD_HASH = await bcrypt.hash('pass123', 12);

const cityData = [
  { name: 'Sofia', slug: 'sofia', latitude: 42.6977, longitude: 23.3219 },
  { name: 'Varna', slug: 'varna', latitude: 43.2141, longitude: 27.9147 },
  { name: 'Burgas', slug: 'burgas', latitude: 42.5048, longitude: 27.4626 },
  { name: 'Plovdiv', slug: 'plovdiv', latitude: 42.1354, longitude: 24.7453 },
] as const;

const propertyTypes = ['apartment', 'house', 'villa', 'office', 'land'] as const;
const listingTypes = ['sale', 'rent'] as const;
const messageTemplates = [
  'I am interested in scheduling a viewing for this property.',
  'Can you share more information about the neighborhood and utilities?',
  'Is this listing still available for viewing this week?',
  'Please contact me with the next steps for this property.',
  'I would like to know whether the asking price is negotiable.',
];

type TableCounts = {
  users: number;
  properties: number;
  favorites: number;
  propertyImages: number;
  propertyMessages: number;
};

function createdAtFromSequence(sequence: number): Date {
  return new Date(Date.now() - sequence * 60_000);
}

function coordinate(base: number, sequence: number): string {
  return (base + ((sequence % 70) - 35) * 0.0017).toFixed(7);
}

function chunkRange(start: number, amount: number): { start: number; end: number }[] {
  const chunks: { start: number; end: number }[] = [];

  for (let current = start; current < start + amount; current += BATCH_SIZE) {
    chunks.push({ start: current, end: Math.min(current + BATCH_SIZE, start + amount) });
  }

  return chunks;
}

async function tableCounts(): Promise<TableCounts> {
  const [userRows, propertyRows, favoriteRows, imageRows, messageRows] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(properties),
    db.select({ value: count() }).from(favorites),
    db.select({ value: count() }).from(propertyImages),
    db.select({ value: count() }).from(propertyMessages),
  ]);

  return {
    users: userRows[0]?.value ?? 0,
    properties: propertyRows[0]?.value ?? 0,
    favorites: favoriteRows[0]?.value ?? 0,
    propertyImages: imageRows[0]?.value ?? 0,
    propertyMessages: messageRows[0]?.value ?? 0,
  };
}

async function ensureCities(): Promise<void> {
  await db
    .insert(cities)
    .values(cityData.map(({ name, slug }) => ({ name, slug })))
    .onConflictDoNothing({ target: cities.slug });
}

async function ensureUsers(currentCount: number): Promise<void> {
  const needed = Math.max(0, TARGET_USERS - currentCount);

  if (needed === 0) {
    return;
  }

  console.log(`Creating ${needed.toLocaleString()} users...`);

  for (const range of chunkRange(currentCount + 1, needed)) {
    const batch = Array.from({ length: range.end - range.start }, (_, index) => {
      const sequence = range.start + index;

      return {
        email: `${LOAD_TEST_PREFIX}.user.${sequence}@estately.local`,
        passwordHash: PASSWORD_HASH,
        fullName: `Load Test User ${sequence}`,
        avatarUrl: null,
        role: sequence % 97 === 0 ? 'admin' : 'user',
        createdAt: createdAtFromSequence(sequence),
        updatedAt: createdAtFromSequence(sequence),
      };
    });

    await db.insert(users).values(batch).onConflictDoNothing({ target: users.email });
  }
}

async function userIds(): Promise<number[]> {
  const rows = await db.select({ id: users.id }).from(users).orderBy(users.id);
  return rows.map((row) => row.id);
}

async function propertyIds(): Promise<number[]> {
  const rows = await db.select({ id: properties.id }).from(properties).orderBy(properties.id);
  return rows.map((row) => row.id);
}

async function ensureProperties(currentCount: number, availableUserIds: number[]): Promise<void> {
  const needed = Math.max(0, TARGET_PROPERTIES - currentCount);

  if (needed === 0) {
    return;
  }

  console.log(`Creating ${needed.toLocaleString()} properties...`);

  for (const range of chunkRange(currentCount + 1, needed)) {
    const batch = Array.from({ length: range.end - range.start }, (_, index) => {
      const sequence = range.start + index;
      const city = cityData[sequence % cityData.length];
      const propertyType = propertyTypes[sequence % propertyTypes.length];
      const listingType = listingTypes[sequence % listingTypes.length];
      const bedrooms = propertyType === 'office' || propertyType === 'land' ? 0 : (sequence % 5) + 1;
      const bathrooms = propertyType === 'land' ? 0 : (sequence % 3) + 1;
      const areaSqm = propertyType === 'land' ? 400 + (sequence % 1200) : 45 + (sequence % 260);
      const price = listingType === 'rent'
        ? 650 + (sequence % 3000)
        : 75_000 + (sequence % 900_000);

      return {
        title: `${city.name} ${propertyType} ${sequence}`,
        description: `Load test ${propertyType} listing in ${city.name} with realistic search, filter, and map data.`,
        price: price.toFixed(2),
        city: city.name,
        address: `${100 + sequence} Load Test Boulevard, ${city.name}`,
        propertyType,
        listingType,
        bedrooms,
        bathrooms,
        areaSqm,
        latitude: coordinate(city.latitude, sequence),
        longitude: coordinate(city.longitude, sequence + 11),
        imageCoverUrl: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&sig=${sequence}`,
        isPublished: sequence % 7 !== 0,
        createdByUserId: availableUserIds[sequence % availableUserIds.length],
        createdAt: createdAtFromSequence(sequence),
        updatedAt: createdAtFromSequence(sequence),
      };
    });

    await db.insert(properties).values(batch);
  }
}

async function ensurePropertyImages(currentCount: number, availablePropertyIds: number[]): Promise<void> {
  const needed = Math.max(0, TARGET_IMAGES - currentCount);

  if (needed === 0) {
    return;
  }

  console.log(`Creating ${needed.toLocaleString()} property images...`);

  for (const range of chunkRange(currentCount + 1, needed)) {
    const batch = Array.from({ length: range.end - range.start }, (_, index) => {
      const sequence = range.start + index;

      return {
        propertyId: availablePropertyIds[sequence % availablePropertyIds.length],
        imageUrl: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&sig=${sequence}`,
        sortOrder: sequence % 4,
      };
    });

    await db.insert(propertyImages).values(batch);
  }
}

async function ensureFavorites(
  currentCount: number,
  availableUserIds: number[],
  availablePropertyIds: number[],
): Promise<void> {
  const needed = Math.max(0, TARGET_FAVORITES - currentCount);

  if (needed === 0) {
    return;
  }

  console.log(`Creating up to ${needed.toLocaleString()} favorites...`);

  for (const range of chunkRange(currentCount + 1, needed)) {
    const batch = Array.from({ length: range.end - range.start }, (_, index) => {
      const sequence = range.start + index;

      return {
        userId: availableUserIds[sequence % availableUserIds.length],
        propertyId: availablePropertyIds[(sequence * 17) % availablePropertyIds.length],
        createdAt: createdAtFromSequence(sequence),
      };
    });

    await db
      .insert(favorites)
      .values(batch)
      .onConflictDoNothing({ target: [favorites.userId, favorites.propertyId] });
  }
}

async function ensureMessages(
  currentCount: number,
  availableUserIds: number[],
  availablePropertyIds: number[],
): Promise<void> {
  const needed = Math.max(0, TARGET_MESSAGES - currentCount);

  if (needed === 0) {
    return;
  }

  console.log(`Creating ${needed.toLocaleString()} inquiries...`);

  for (const range of chunkRange(currentCount + 1, needed)) {
    const batch = Array.from({ length: range.end - range.start }, (_, index) => {
      const sequence = range.start + index;

      return {
        propertyId: availablePropertyIds[(sequence * 13) % availablePropertyIds.length],
        userId: availableUserIds[(sequence * 7) % availableUserIds.length],
        message: `${messageTemplates[sequence % messageTemplates.length]} Ref ${sequence}.`,
        createdAt: createdAtFromSequence(sequence),
      };
    });

    await db.insert(propertyMessages).values(batch);
  }
}

async function analyzeTables(): Promise<void> {
  await db.execute(sql`ANALYZE users`);
  await db.execute(sql`ANALYZE properties`);
  await db.execute(sql`ANALYZE favorites`);
  await db.execute(sql`ANALYZE property_images`);
  await db.execute(sql`ANALYZE property_messages`);
}

async function main() {
  console.log('Preparing load-test data...');
  await ensureCities();

  const initialCounts = await tableCounts();
  console.log('Initial counts:', initialCounts);

  await ensureUsers(initialCounts.users);
  const availableUserIds = await userIds();

  const afterUsersCounts = await tableCounts();
  await ensureProperties(afterUsersCounts.properties, availableUserIds);
  const availablePropertyIds = await propertyIds();

  const afterPropertiesCounts = await tableCounts();
  await ensurePropertyImages(afterPropertiesCounts.propertyImages, availablePropertyIds);
  await ensureFavorites(afterPropertiesCounts.favorites, availableUserIds, availablePropertyIds);

  const afterFavoritesCounts = await tableCounts();
  await ensureMessages(afterFavoritesCounts.propertyMessages, availableUserIds, availablePropertyIds);
  await analyzeTables();

  const finalCounts = await tableCounts();
  console.log('Final counts:', finalCounts);
  console.log('Load-test data ready.');
}

main().catch((error) => {
  console.error('Load-test data population failed:', error);
  process.exit(1);
});
