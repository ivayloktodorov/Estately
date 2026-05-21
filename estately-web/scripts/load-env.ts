import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, '..');
const rootDir = path.resolve(webDir, '..');

for (const envPath of [
  path.join(rootDir, '.env'),
  path.join(rootDir, '.env.local'),
  path.join(webDir, '.env'),
  path.join(webDir, '.env.local'),
]) {
  config({ path: envPath, override: false, quiet: true });
}

export function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Add it to .env at the repo root or estately-web/.env.local.',
    );
  }

  return databaseUrl;
}
