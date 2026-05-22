# Database Usage Guide

## Importing the Database Client

```typescript
import { db } from '@/db/client';
import { users, properties, favorites, cities } from '@/db/schema';
```

## Common Database Queries

### Query Users

```typescript
// Get all users
const allUsers = await db.select().from(users);

// Get user by email
const user = await db.select().from(users)
  .where(eq(users.email, 'john@gmail.com'));

// Get user by ID
const user = await db.select().from(users)
  .where(eq(users.id, 1));

// Count all users
const [{ count }] = await db
  .select({ count: count() })
  .from(users);
```

### Query Properties

```typescript
// Get all published properties
const props = await db.select().from(properties)
  .where(eq(properties.isPublished, true));

// Get properties in a city
const sofiaProps = await db.select().from(properties)
  .where(eq(properties.city, 'Sofia'));

// Get properties by price range
const affordable = await db.select().from(properties)
  .where(and(
    gte(properties.price, '100000'),
    lte(properties.price, '300000')
  ));

// Get properties by type
const apartments = await db.select().from(properties)
  .where(eq(properties.propertyType, 'apartment'));

// Get property with images
const prop = await db.select({
  property: properties,
  images: propertyImages,
}).from(properties)
  .leftJoin(propertyImages, 
    eq(properties.id, propertyImages.propertyId))
  .where(eq(properties.id, 1));

// Get recent properties with pagination
const recent = await db.select().from(properties)
  .orderBy(desc(properties.createdAt))
  .limit(10)
  .offset(0);
```

### Query Favorites

```typescript
// Get user's favorite properties
const favorites = await db.select({
  favorite: favorites,
  property: properties,
}).from(favorites)
  .innerJoin(properties, 
    eq(favorites.propertyId, properties.id))
  .where(eq(favorites.userId, userId));

// Check if property is favorited
const isFavorited = await db.select().from(favorites)
  .where(and(
    eq(favorites.userId, userId),
    eq(favorites.propertyId, propertyId)
  ));

// Count user's favorites
const count = await db
  .select({ count: count() })
  .from(favorites)
  .where(eq(favorites.userId, userId));
```

### Query Messages

```typescript
// Get all messages for a property
const messages = await db.select({
  message: propertyMessages,
  user: users,
}).from(propertyMessages)
  .leftJoin(users, 
    eq(propertyMessages.userId, users.id))
  .where(eq(propertyMessages.propertyId, propertyId));

// Get messages from a user
const userMessages = await db.select().from(propertyMessages)
  .where(eq(propertyMessages.userId, userId));
```

## Mutations (Create, Update, Delete)

### Insert Records

```typescript
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';

// Create a new user
const passwordHash = await bcrypt.hash(password, 12);
const newUser = await db.insert(users).values({
  email,
  passwordHash,
  fullName,
  role: 'user',
}).returning();

// Create multiple records
const cities = await db.insert(citiesTable).values([
  { name: 'Sofia', slug: 'sofia' },
  { name: 'Varna', slug: 'varna' },
]).returning();
```

### Update Records

```typescript
import { eq } from 'drizzle-orm';

// Update user profile
await db.update(users)
  .set({
    fullName: 'New Name',
    avatarUrl: 'https://example.com/avatar.jpg',
    updatedAt: new Date(),
  })
  .where(eq(users.id, userId));

// Update property
await db.update(properties)
  .set({
    isPublished: true,
    updatedAt: new Date(),
  })
  .where(eq(properties.id, propertyId));
```

### Delete Records

```typescript
// Delete user (cascades to their properties, messages, favorites)
await db.delete(users)
  .where(eq(users.id, userId));

// Delete property (cascades to images, messages, favorites)
await db.delete(properties)
  .where(eq(properties.id, propertyId));

// Remove favorite
await db.delete(favorites)
  .where(and(
    eq(favorites.userId, userId),
    eq(favorites.propertyId, propertyId)
  ));
```

## API Route Example

```typescript
// app/api/properties/route.ts
import { db } from '@/db/client';
import { properties } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = 20;
    const offset = page * limit;

    const props = await db.select().from(properties)
      .where(eq(properties.isPublished, true))
      .orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset);

    return Response.json({ success: true, data: props });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const newProperty = await db.insert(properties).values({
      title: body.title,
      description: body.description,
      price: body.price,
      city: body.city,
      address: body.address,
      propertyType: body.propertyType,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      areaSqm: body.areaSqm,
      imageCoverUrl: body.imageCoverUrl,
      isPublished: false,
      createdByUserId: body.userId, // from JWT token
    }).returning();

    return Response.json({ success: true, data: newProperty[0] });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## Type Safety

All database operations are fully type-safe:

```typescript
// TypeScript will catch these errors at compile time:

// ❌ Unknown column
await db.select().from(users).where(eq(users.invalidColumn, value));

// ❌ Wrong value type
await db.update(users).set({ email: 123 }); // should be string

// ❌ Unknown table
await db.select().from(invalidTable);
```

## Error Handling

```typescript
import { users } from '@/db/schema';

try {
  const user = await db.insert(users).values({
    email: 'duplicate@example.com',
    passwordHash: 'hash',
    fullName: 'Name',
  }).returning();
} catch (error) {
  // Handle unique constraint violations
  if (error.code === '23505') {
    console.error('Email already exists');
  }
  
  // Handle other database errors
  console.error('Database error:', error.message);
}
```

## Performance Tips

1. **Use Pagination:** Always limit results
   ```typescript
   .limit(20).offset(page * 20)
   ```

2. **Select Only Needed Columns:**
   ```typescript
   db.select({ id: users.id, email: users.email }).from(users)
   ```

3. **Use Indexes:** Query by indexed columns
   - `properties.city` - indexed
   - `properties.propertyType` - indexed
   - `properties.price` - indexed
   - `properties.createdAt` - indexed

4. **Batch Operations:** Insert multiple records at once
   ```typescript
   await db.insert(table).values([record1, record2, record3])
   ```

## Debugging

Enable Drizzle Studio for local development:

```bash
npx drizzle-kit studio
```

This opens a web UI to browse and query your database directly.

## Schema Changes Workflow

1. **Edit schema file** (`src/db/schema/*.ts`)
2. **Generate migration:**
   ```bash
   npm run db:generate
   ```
3. **Review migration** (`src/drizzle/XXXX_*.sql`)
4. **Run migration:**
   ```bash
   npm run db:migrate
   ```
5. **Deploy to production** (CI/CD will run migration before deploy)
