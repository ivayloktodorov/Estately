import type { Config } from 'drizzle-kit';
import { requireDatabaseUrl } from './scripts/load-env';

export default {
  schema: './src/db/schema',
  out: './src/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: requireDatabaseUrl(),
  },
} satisfies Config;
