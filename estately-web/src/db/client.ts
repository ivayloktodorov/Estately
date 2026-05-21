import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create drizzle instance with Neon HTTP connection
export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
});

export type Database = typeof db;
