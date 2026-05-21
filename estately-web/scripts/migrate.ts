import { migrate } from 'drizzle-orm/neon-http/migrator';
import { drizzle } from 'drizzle-orm/neon-http';
import { requireDatabaseUrl } from './load-env';

const db = drizzle({
  connection: requireDatabaseUrl(),
});

async function main() {
  try {
    console.log('⏳ Running migrations...');
    await migrate(db, { migrationsFolder: './src/drizzle' });
    console.log('✓ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

main();
