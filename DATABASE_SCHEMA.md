# Estately Database Schema

## Overview

Estately uses **Neon PostgreSQL** with **Drizzle ORM** for type-safe, scalable database management. The database follows normalized design patterns with proper relationships, indexes, and constraints.

## Schema Diagram

```
users (14 rows)
├── properties (20 rows) - Foreign key: created_by_user_id
│   ├── property_images (40+ rows)
│   ├── favorites (user_property pairs)
│   └── property_messages (inquiries)
├── favorites (many rows)
└── property_messages (many rows)

cities (4 rows) - Referenced in properties.city
```

## Tables

### Users Table
**Purpose:** Store user accounts with authentication

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, auto-increment |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL (bcryptjs, cost: 12) |
| full_name | VARCHAR(255) | NOT NULL |
| avatar_url | TEXT | Nullable |
| role | VARCHAR(50) | DEFAULT 'user' (admin/user) |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

**Sample Data:**
- admin@estately.com (admin role)
- 13 regular users (user1@gmail.com - user10@gmail.com, john@gmail.com, maria@gmail.com, david@gmail.com)
- All have password hash for "pass123"

### Cities Table
**Purpose:** Predefined list of cities for filtering/search

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, auto-increment |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | UNIQUE NOT NULL |

**Sample Data:**
- Sofia
- Varna
- Burgas
- Plovdiv

### Properties Table
**Purpose:** Real estate listings

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, auto-increment |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| price | NUMERIC(12, 2) | NOT NULL |
| city | VARCHAR(255) | NOT NULL |
| address | VARCHAR(255) | NOT NULL |
| property_type | VARCHAR(50) | NOT NULL (apartment/house/office/studio) |
| bedrooms | INT | NOT NULL |
| bathrooms | INT | NOT NULL |
| area_sqm | INT | NOT NULL |
| image_cover_url | TEXT | NOT NULL |
| is_published | BOOLEAN | DEFAULT false |
| created_by_user_id | INT | FOREIGN KEY → users.id (CASCADE) |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

**Indexes:**
- city (for search/filtering)
- property_type (for filtering)
- price (for range queries)
- created_at (for recent properties)

**Sample Data:** 20 properties across all cities and types

### Property_Images Table
**Purpose:** Gallery images for each property

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, auto-increment |
| property_id | INT | FOREIGN KEY → properties.id (CASCADE) |
| image_url | TEXT | NOT NULL |
| sort_order | INT | DEFAULT 0 |

**Sample Data:** 2-4 images per property (~40+ total)

### Favorites Table
**Purpose:** Users' saved properties

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, auto-increment |
| user_id | INT | FOREIGN KEY → users.id (CASCADE) |
| property_id | INT | FOREIGN KEY → properties.id (CASCADE) |
| created_at | TIMESTAMP | DEFAULT now() |
| Unique Constraint | (user_id, property_id) | Prevents duplicate favorites |

**Sample Data:** 10+ favorites from various users

### Property_Messages Table
**Purpose:** Property inquiry messages from users

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, auto-increment |
| property_id | INT | FOREIGN KEY → properties.id (CASCADE) |
| user_id | INT | FOREIGN KEY → users.id (CASCADE) |
| message | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |

**Sample Data:** 15+ inquiry messages for first 10 properties

## Database Commands

### Setup & Migrations

```bash
# Install dependencies
npm install -w estately-web

# Generate migrations from schema changes
cd estately-web
npm run db:generate

# Run all pending migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Drizzle ORM Configuration

Configuration is in `estately-web/drizzle.config.ts`:
- **Dialect:** PostgreSQL
- **Connection:** Neon HTTP (serverless)
- **Migrations:** `src/drizzle/`
- **Schema:** `src/db/schema/`

## Database Connection

File: `estately-web/src/db/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
  },
  schema,
});
```

## Environment Variables

Required in `.env` file at root directory:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_secret_key_here
```

## Schema Best Practices Implemented

✅ **Proper Relations:** All foreign keys are properly defined
✅ **Cascading Deletes:** Deleting user/property cascades to related records
✅ **Unique Constraints:** Prevent duplicate emails, user-property pairs
✅ **Indexes:** Added on frequently queried columns (city, type, price, date)
✅ **Timestamps:** All tables have created_at, properties have updated_at
✅ **Type Safety:** Drizzle ORM provides TypeScript types
✅ **Normalization:** Properties reference cities by name (can be improved with FK)
✅ **Scalable Structure:** Ready for pagination, filtering, and growth

## Future Improvements

1. Add property status enum (active/sold/rented)
2. Add user phone/address fields
3. Create property features table (pool, garden, etc.)
4. Add audit log table for admin actions
5. Implement full-text search on property titles/descriptions
6. Add property viewing schedule table
7. Create notification preferences table

## Verification

To verify the database setup:

```bash
cd estately-web
npx tsx scripts/verify.ts
```

This will show:
- User count
- Cities count
- Properties count
- Messages count
- Favorites count
- Sample user details
