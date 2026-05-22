import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, cities, properties, propertyMessages, favorites } from '../src/db/schema';
import { count, sql } from 'drizzle-orm';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  const envContent = fs.readFileSync(rootEnvPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && !process.env[key]) {
        process.env[key] = valueParts.join('=').trim();
      }
    }
  });
}

const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
  },
  schema: { users, cities, properties, propertyMessages, favorites },
});

async function verify() {
  try {
    console.log('📊 Database Verification\n');
    console.log('=======================\n');

    const usersCount = await db.select({ count: count() }).from(users);
    const citiesCount = await db.select({ count: count() }).from(cities);
    const propertiesCount = await db.select({ count: count() }).from(properties);
    const messagesCount = await db.select({ count: count() }).from(propertyMessages);
    const favoritesCount = await db.select({ count: count() }).from(favorites);

    console.log(`✓ Users:            ${usersCount[0]?.count || 0}`);
    console.log(`✓ Cities:           ${citiesCount[0]?.count || 0}`);
    console.log(`✓ Properties:       ${propertiesCount[0]?.count || 0}`);
    console.log(`✓ Property Messages: ${messagesCount[0]?.count || 0}`);
    console.log(`✓ Favorites:        ${favoritesCount[0]?.count || 0}`);

    // Get sample user
    const sampleUser = await db.select().from(users).limit(1);
    if (sampleUser.length > 0) {
      console.log('\n📝 Sample User:');
      console.log(`  Email: ${sampleUser[0].email}`);
      console.log(`  Name:  ${sampleUser[0].fullName}`);
      console.log(`  Role:  ${sampleUser[0].role}`);
    }

    console.log('\n✅ Database verification completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verify();
