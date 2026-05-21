# Estately Web - Next.js Full-Stack Instructions

## Project Overview

**Estately Web** is a modern, full-stack real estate platform built with Next.js and React. Users can browse, search, filter, and save property listings. Administrators have a dedicated dashboard for managing listings, user accounts, and platform content.

---

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT with httpOnly cookies
- **File Storage**: Cloudflare R2
- **Validation**: Zod for runtime validation

---

## Architectural Guidelines

### 1. App Structure
```
app/
├── (auth)/                # Auth routes (public)
│   ├── login/
│   ├── signup/
│   └── layout.tsx
├── (dashboard)/           # Protected routes
│   ├── listings/
│   ├── favorites/
│   ├── profile/
│   ├── admin/
│   └── layout.tsx
├── api/                   # API routes
│   ├── auth/
│   ├── listings/
│   ├── search/
│   ├── uploads/
│   └── users/
├── layout.tsx            # Root layout
├── page.tsx              # Home page
└── globals.css           # Global styles
```

### 2. Layered Architecture
```typescript
// 1. Route Handler (api/listings/route.ts)
//    - Handle HTTP requests/responses
//    - Input validation
//    - Call service layer

// 2. Service Layer (lib/services/listings.ts)
//    - Business logic
//    - Database operations
//    - External API calls

// 3. Database Layer (lib/db/listings.ts)
//    - Drizzle queries
//    - Raw SQL only if necessary
//    - Type-safe operations

// 4. Types (lib/types/listings.ts)
//    - Interfaces and schemas
//    - Validation rules
```

### 3. Server vs Client Components
```typescript
// Server Components (default)
// - Fetch data
// - Query databases
// - Handle sensitive operations
// - Generate metadata

export default async function ListingPage({ params }) {
  const listing = await getListing(params.id);
  return <ListingDetail listing={listing} />;
}

// Client Components (interactive features)
// - Form handling
// - Event listeners
// - Hooks (useState, useEffect)
// - Real-time updates

'use client';
export function SearchFilter() {
  const [query, setQuery] = useState('');
  // ...
}
```

### 4. Data Fetching Strategy
- Use server components for initial data load
- Implement React Server Components (RSC) for nested data
- Use `revalidatePath()` or `revalidateTag()` for ISR
- Avoid N+1 queries with proper JOIN statements

---

## Database Guidelines

### 1. Schema Design with Drizzle
```typescript
// Define tables with relations
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  price: integer('price').notNull(),
  beds: integer('beds').notNull(),
  baths: numeric('baths').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  description: text('description'),
  imageUrls: text('image_urls').array(),
  
  // Status: 'active', 'pending', 'sold', 'archived'
  status: text('status').default('active').notNull(),
  
  agentId: uuid('agent_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Index frequently searched columns
export const listingsIndexes = {
  byCity: index('listings_city_idx').on(listings.city),
  byPrice: index('listings_price_idx').on(listings.price),
  byStatus: index('listings_status_idx').on(listings.status),
};

// Define relations
export const listingsRelations = relations(listings, ({ one, many }) => ({
  agent: one(users, { fields: [listings.agentId], references: [users.id] }),
  favorites: many(favorites),
}));
```

### 2. Query Patterns
```typescript
// Get with relations
const listing = await db.query.listings.findFirst({
  where: eq(listings.id, listingId),
  with: { agent: true, favorites: true },
});

// Pagination
const limit = 20;
const offset = (page - 1) * limit;
const items = await db.select().from(listings)
  .limit(limit)
  .offset(offset)
  .orderBy(listings.createdAt);

// Filtering with multiple conditions
const results = await db.select().from(listings).where(
  and(
    eq(listings.city, city),
    gte(listings.price, minPrice),
    lte(listings.price, maxPrice),
    inArray(listings.beds, bedrooms)
  )
);
```

### 3. Migrations
- Use Drizzle migrations for schema changes
- Keep migrations reversible
- Test on staging before production
- Document data transformation logic

---

## Authentication & Authorization

### 1. JWT Implementation
```typescript
// Generate token
const token = jwt.sign(
  {
    userId: user.id,
    role: user.role, // 'user' | 'admin' | 'moderator'
    email: user.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Store in httpOnly cookie
res.cookies.set('token', token, {
  httpOnly: true,
  secure: true, // HTTPS only in production
  sameSite: 'strict',
  maxAge: 24 * 60 * 60, // 24 hours
});
```

### 2. Middleware Authentication
```typescript
// middleware.ts
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return Response.redirect(new URL('/login', request.url));
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    request.user = user;
  } catch {
    return Response.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

### 3. Role-Based Access Control
```typescript
// Middleware for role checking
export function requireRole(roles: string[]) {
  return (handler) => async (req, res) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    return handler(req, res);
  };
}

// Usage
export const POST = requireRole(['admin'])(async (req) => {
  // Only admins can access
});
```

### 4. Password Security
```typescript
import bcrypt from 'bcrypt';

// Hash password
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## REST API Conventions

### 1. Endpoint Structure
```
GET    /api/listings              # List all (paginated, filterable)
POST   /api/listings              # Create new
GET    /api/listings/:id          # Get single
PATCH  /api/listings/:id          # Update
DELETE /api/listings/:id          # Delete

GET    /api/search/listings?q=... # Search listings
GET    /api/listings/:id/photos   # Get listing photos
POST   /api/listings/:id/photos   # Upload photos
```

### 2. Request/Response Format
```typescript
// Success response
{
  status: 'success',
  data: {
    id: '123',
    title: 'Beautiful House',
    price: 500000,
    // ...
  }
}

// Paginated response
{
  status: 'success',
  data: [...],
  meta: {
    page: 1,
    pageSize: 20,
    total: 150,
    totalPages: 8
  }
}

// Error response
{
  status: 'error',
  error: {
    code: 'INVALID_INPUT',
    message: 'Price must be greater than 0',
    fields: { price: 'Invalid value' }
  }
}
```

### 3. Input Validation with Zod
```typescript
import { z } from 'zod';

const CreateListingSchema = z.object({
  title: z.string().min(5).max(200),
  price: z.number().int().positive(),
  beds: z.number().int().min(0).max(10),
  baths: z.number().positive(),
  address: z.string().min(5),
  city: z.string().min(2),
  description: z.string().optional(),
});

type CreateListingInput = z.infer<typeof CreateListingSchema>;

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  try {
    const validated = CreateListingSchema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: { code: 'INVALID_INPUT', message: error.message } },
      { status: 400 }
    );
  }
}
```

### 4. Error Responses
```typescript
// 400 Bad Request - Invalid input
{ status: 'error', error: { code: 'INVALID_INPUT', message: '...' } }

// 401 Unauthorized - Missing/invalid token
{ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }

// 403 Forbidden - Insufficient permissions
{ status: 'error', error: { code: 'FORBIDDEN', message: 'Admin access required' } }

// 404 Not Found - Resource doesn't exist
{ status: 'error', error: { code: 'NOT_FOUND', message: 'Listing not found' } }

// 409 Conflict - Constraint violation
{ status: 'error', error: { code: 'CONFLICT', message: 'Email already registered' } }

// 500 Server Error
{ status: 'error', error: { code: 'INTERNAL_ERROR', message: 'Unexpected error occurred' } }
```

---

## Service Layer Architecture

### 1. Service Organization
```typescript
// lib/services/listings.ts
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema';

export const listingService = {
  async getAll(page: number, limit: number) {
    const offset = (page - 1) * limit;
    return db.select().from(listings)
      .limit(limit)
      .offset(offset);
  },

  async getById(id: string) {
    return db.query.listings.findFirst({
      where: eq(listings.id, id),
      with: { agent: true, favorites: true },
    });
  },

  async create(data: CreateListingInput) {
    return db.insert(listings).values(data).returning();
  },

  async update(id: string, data: Partial<CreateListingInput>) {
    return db.update(listings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
  },

  async delete(id: string) {
    return db.delete(listings).where(eq(listings.id, id));
  },

  async search(query: SearchQuery) {
    return db.select().from(listings).where(
      and(
        query.city ? eq(listings.city, query.city) : undefined,
        query.minPrice ? gte(listings.price, query.minPrice) : undefined,
        query.maxPrice ? lte(listings.price, query.maxPrice) : undefined,
        query.beds ? inArray(listings.beds, query.beds) : undefined,
      )
    ).limit(query.limit || 20);
  },
};
```

### 2. Error Handling in Services
```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export async function getListingOrThrow(id: string) {
  const listing = await listingService.getById(id);
  if (!listing) {
    throw new AppError('NOT_FOUND', 404, 'Listing not found');
  }
  return listing;
}
```

---

## Server Components Usage

### 1. Data Fetching in Server Components
```typescript
// app/listings/[id]/page.tsx
import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/listing-detail';

export async function generateMetadata({ params }) {
  const listing = await listingService.getById(params.id);
  return {
    title: listing?.title || 'Listing',
    description: listing?.description,
  };
}

export default async function ListingPage({ params }) {
  const listing = await listingService.getById(params.id);
  
  if (!listing) {
    notFound();
  }
  
  return <ListingDetail listing={listing} />;
}
```

### 2. Dynamic Routes
```typescript
// Revalidate every 1 hour
export const revalidate = 3600;

// Generate static params for common listings
export async function generateStaticParams() {
  const popularListings = await db.select()
    .from(listings)
    .orderBy(desc(listings.views))
    .limit(100);
  
  return popularListings.map((listing) => ({
    id: listing.id,
  }));
}
```

---

## Responsive UI Guidelines

### 1. Mobile-First Design
```typescript
// Use Tailwind responsive prefixes
export function ListingCard({ listing }) {
  return (
    <div className="
      grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
      gap-4 md:gap-6
      p-4 md:p-8
    ">
      {/* Content */}
    </div>
  );
}
```

### 2. Image Optimization
```typescript
import Image from 'next/image';

export function ListingImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="object-cover rounded-lg"
      priority={false}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
```

### 3. Responsive Layouts
```typescript
// Mobile: Stack, Tablet: 2 columns, Desktop: 3 columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"

// Hide on mobile, show on tablet+
className="hidden sm:block"

// Text sizes for readability
className="text-sm md:text-base lg:text-lg"
```

---

## Reusable Component Architecture

### 1. Atomic Components
```
components/
├── ui/              # Base components (reusable)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── modal.tsx
├── listing/         # Feature components
│   ├── listing-card.tsx
│   ├── listing-detail.tsx
│   └── listing-form.tsx
├── search/          # Feature components
│   ├── search-filter.tsx
│   └── search-results.tsx
└── common/          # Layout components
    ├── header.tsx
    ├── sidebar.tsx
    └── footer.tsx
```

### 2. Prop Patterns
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`button button-${variant} button-${size}`}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
```

### 3. Compound Components
```typescript
export function Card({ children }) {
  return <div className="border rounded-lg">{children}</div>;
}

Card.Header = function CardHeader({ children }) {
  return <div className="border-b p-4">{children}</div>;
};

Card.Body = function CardBody({ children }) {
  return <div className="p-4">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Listings</Card.Header>
  <Card.Body>Content here</Card.Body>
</Card>
```

---

## Performance & Pagination Rules

### 1. Pagination Implementation
```typescript
// Always paginate large result sets
const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || DEFAULT_PAGE_SIZE);
  
  const [items, count] = await Promise.all([
    db.select().from(listings)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: count() }).from(listings),
  ]);
  
  return NextResponse.json({
    status: 'success',
    data: items,
    meta: {
      page,
      pageSize: limit,
      total: count[0].count,
      totalPages: Math.ceil(count[0].count / limit),
    },
  });
}
```

### 2. Database Query Optimization
```typescript
// ✓ Good: Use indexes, fetch only needed columns
const listings = await db
  .select({ id: listings.id, title: listings.title, price: listings.price })
  .from(listings)
  .where(eq(listings.city, city))
  .limit(20);

// ✗ Bad: Full table scan, select all columns
const listings = await db.select().from(listings);
```

### 3. Caching Strategies
```typescript
// Cache static content
export const revalidate = 3600; // 1 hour

// Cache user-specific content
import { unstable_cache } from 'next/cache';

export const getCachedUserListings = unstable_cache(
  async (userId) => {
    return db.select().from(listings)
      .where(eq(listings.agentId, userId));
  },
  ['user-listings'],
  { revalidate: 300 } // 5 minutes
);
```

---

## File Upload Handling

### 1. Image Upload to Cloudflare R2
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

export async function uploadImage(file: File) {
  const buffer = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: `listings/${filename}`,
      Body: buffer,
      ContentType: file.type,
    })
  );
  
  return `${process.env.R2_PUBLIC_URL}/listings/${filename}`;
}
```

### 2. File Validation
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateImage(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 5MB)' };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  return { valid: true };
}
```

---

## Admin Dashboard Architecture

### 1. Admin Routes Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const user = request.user;
    if (user?.role !== 'admin') {
      return Response.redirect(new URL('/dashboard', request.url));
    }
  }
}
```

### 2. Admin Features
- **Listing Management**: Create, edit, delete listings
- **User Management**: View, moderate, suspend users
- **Analytics Dashboard**: Views, clicks, favorites, searches
- **Content Management**: Pages, FAQs, support articles
- **Moderation**: Flag inappropriate content, handle reports

### 3. Admin Components
```typescript
// app/(dashboard)/admin/listings/page.tsx
export default async function AdminListingsPage() {
  const listings = await listingService.getAll(1, 50);
  
  return (
    <div>
      <h1>Manage Listings</h1>
      <ListingTable listings={listings} />
      <CreateListingButton />
    </div>
  );
}
```

---

## Best Practices Summary

- ✓ Use Server Components by default, Client Components only when needed
- ✓ Implement proper TypeScript typing throughout
- ✓ Validate all inputs with Zod
- ✓ Use service layer for business logic
- ✓ Implement pagination for all list endpoints
- ✓ Optimize images with Next.js Image component
- ✓ Use database indexes on frequently queried columns
- ✓ Implement rate limiting on sensitive endpoints
- ✓ Log errors with context for debugging
- ✓ Test critical user flows with E2E tests

---

## Related Documentation

- [Global Instructions](../AGENTS.md)
- [Mobile App Instructions](../estately-mobile/AGENTS.md)
