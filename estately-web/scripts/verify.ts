import { drizzle } from 'drizzle-orm/neon-http';
import { users, cities, properties, propertyMessages, favorites } from '../src/db/schema';
import { count } from 'drizzle-orm';
import { requireDatabaseUrl } from './load-env';

const db = drizzle({
  connection: requireDatabaseUrl(),
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
