# Estately

Estately is a Zillow-inspired real estate platform where users can browse, search, save, and manage property listings. The project includes a Next.js web application, an Expo React Native mobile app, a backend REST API, an admin panel, property image uploads, favorites, inquiries, map/search functionality, and a Neon PostgreSQL database managed with Drizzle ORM.

## Project Overview

Estately is built as a full-stack monorepo:

- **Web app:** public property browsing, property details, authentication, dashboards, admin moderation, favorites, inquiries, image uploads, maps, search, and pagination.
- **Mobile app:** Expo app with login, registration, property feed, search and filters, property details, favorites, inquiries, profile, and logout.
- **Backend API:** Next.js API routes for mobile clients and server-side web workflows.
- **Admin panel:** user overview, property moderation, and dashboard views.
- **Database:** Neon PostgreSQL with Drizzle schema and migrations.
- **Storage:** Cloudflare R2 for property images.

## Tech Stack

### Web

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API routes
- Next.js Server Actions
- JWT authentication
- bcrypt password hashing

### Database

- Neon PostgreSQL
- Drizzle ORM
- Drizzle migrations

### Mobile

- Expo
- React Native
- Expo Router
- React Query

### Storage

- Cloudflare R2

### Deployment

- Netlify, Vercel, or another serverless/static hosting platform
- Expo Web static export for the mobile app

## Architecture

Estately uses a client-server architecture inside a monorepo.

The **web app** is a Next.js application. Public and dashboard pages use App Router patterns, Server Components where appropriate, and Server Actions for form-driven workflows such as authentication, property creation, favorites, inquiries, and dashboard operations.

The **mobile app** is an Expo React Native application. It communicates with the backend through REST endpoints under `/api/mobile`. Authenticated mobile requests use `Authorization: Bearer <token>`.

The **backend** runs inside the Next.js web app. It validates requests, checks authentication and authorization, and talks to Neon PostgreSQL through Drizzle ORM.

The **database layer** is defined in `estately-web/src/db/schema`. Drizzle migrations live in `estately-web/src/drizzle`.

The **file storage layer** uploads property images to Cloudflare R2. Uploaded images are stored externally and referenced by URL in the database.

## Repo Structure

```text
Estately/
├── apps/
│   └── mobile/                       # Expo React Native app
│       ├── app/                      # Expo Router screens
│       │   ├── (auth)/               # Login and registration
│       │   ├── (tabs)/               # Home, Search, Favorites, Profile
│       │   └── property/[id]/        # Mobile property details
│       ├── components/               # Mobile UI and property components
│       ├── constants/                # Mobile API/theme config
│       ├── hooks/                    # Mobile auth/favorites hooks
│       ├── services/                 # Mobile REST API services
│       ├── types/                    # Mobile TypeScript types
│       └── README.md                 # Mobile web export notes
│
├── estately-web/                     # Next.js web app and backend
│   ├── app/                          # App Router pages and route handlers
│   │   ├── api/mobile/               # Mobile REST API
│   │   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/                # User dashboard
│   │   ├── favorites/                # Web favorites page
│   │   └── properties/               # Property listing and details pages
│   ├── components/                   # Web UI components
│   ├── lib/                          # Auth, admin, favorites, inquiries, property logic
│   ├── services/                     # Storage/R2 services
│   ├── scripts/                      # Migrate, seed, verify, load-test scripts
│   ├── src/db/schema/                # Drizzle table schemas
│   └── src/drizzle/                  # Drizzle migrations
│
├── estately-mobile/                  # Legacy/starter Expo workspace kept in repo
├── package.json                      # npm workspaces
├── AGENTS.md                         # Agent/project instructions
└── README.md                         # This documentation
```

## Database Schema

Main tables:

- **`users`**: registered accounts with email, bcrypt password hash, full name, avatar URL, role, and timestamps.
- **`properties`**: property listings with title, description, price, city, address, property type, listing type, bedrooms, bathrooms, area, coordinates, cover image URL, published status, owner, and timestamps.
- **`property_images`**: additional images for each property.
- **`favorites`**: many-to-many relationship between users and saved properties.
- **`property_messages`**: inquiry messages sent by users about properties.
- **`cities`**: supported city metadata.

Relationships:

- A **user creates many properties** through `properties.createdByUserId`.
- A **property has many images** through `property_images.propertyId`.
- A **user saves many properties** through `favorites.userId`.
- A **property can be saved by many users** through `favorites.propertyId`.
- A **user sends property inquiry messages** through `property_messages.userId`.
- A **property receives many inquiry messages** through `property_messages.propertyId`.

Important indexes are defined for common browsing and admin workloads:

- `properties_city_idx`
- `properties_property_type_idx`
- `properties_listing_type_idx`
- `properties_price_idx`
- `properties_created_at_idx`
- `properties_is_published_idx`
- Additional indexes for bedrooms, bathrooms, area, property owner, favorites, users, and inquiries.

For a full ERD, table-by-table field reference, examples, and scalability notes, see [Database Schema Documentation](./docs/database-schema.md).

## Scalability And Performance

The project includes a scalability dataset for validating search, filtering, pagination, and dashboard performance.

Verified performance state:

- `properties` count: **10,000**
- Mobile-style paginated query: around **48ms**
- City filter query: around **46ms**
- Property type filter query: around **47ms**

Scalability features:

- Server-side pagination for property lists.
- Database filtering for city, property type, listing type, price, bedrooms, bathrooms, and publish status.
- Indexed fields for common filters and sorting.
- Load-test script for generating large datasets.

Useful scripts:

```bash
npm run --workspace=estately-web db:seed
npm run --workspace=estately-web db:load-test
npm run --workspace=estately-web db:verify
```

## Authentication

Estately supports account registration, login, logout, role-based access, and protected routes.

Authentication details:

- Users register with email, password, and full name.
- Passwords are hashed with bcrypt.
- Login returns a JWT.
- Web sessions use protected server-side checks.
- Mobile API requests use bearer token authentication.
- Supported roles include `user` and `admin`.
- Admin-only areas deny non-admin users.
- Invalid or expired mobile tokens are cleared and redirect users to login.

Demo credentials:

```text
Admin:
admin@estately.com / pass123

Regular user:
john@gmail.com / pass123
```

## REST API Overview

Mobile REST API endpoints live under `estately-web/app/api/mobile`.

Authentication:

```http
POST /api/mobile/auth/login
POST /api/mobile/auth/register
GET  /api/mobile/me
```

Properties:

```http
GET /api/mobile/properties
GET /api/mobile/properties/[id]
```

Supported `GET /api/mobile/properties` query params:

- `search`
- `city`
- `propertyType`
- `listingType`
- `minPrice`
- `maxPrice`
- `bedrooms`
- `bathrooms`
- `sort`
- `page`
- `limit`

Favorites:

```http
GET    /api/mobile/favorites
POST   /api/mobile/favorites
DELETE /api/mobile/favorites/[propertyId]
```

Inquiries:

```http
POST /api/mobile/properties/[id]/inquiries
```

Authenticated mobile requests must include:

```http
Authorization: Bearer <token>
```

## Web App Features

Public web features:

- Home and marketing pages.
- Login and registration.
- Property browsing.
- Property details with image gallery.
- Search and filters.
- Pagination.
- Map/search functionality.
- Favorites.
- Property inquiries.

Authenticated user features:

- Add property.
- Manage own properties.
- View inquiry messages.
- Save and remove favorites.
- Upload property images.

Admin features:

- Admin dashboard.
- User management.
- Property moderation.
- Publish/unpublish properties.
- Delete invalid properties.

## Mobile App Features

The Expo mobile app includes:

- Login.
- Register.
- Home property list.
- Property details.
- Favorite/unfavorite properties.
- Favorites tab.
- Search and filters.
- Property inquiry form.
- Profile screen.
- Logout.

The mobile app can run as a native Expo app or as a static Expo Web export.

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Git
- Neon PostgreSQL database
- Cloudflare R2 bucket for image upload features

### 1. Clone The Repo

```bash
git clone <repository-url>
cd Estately
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create local environment files as needed. Do not commit real secrets.

Web/backend variables:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret

R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
R2_PUBLIC_URL=https://your-public-r2-domain.example.com
```

Mobile variable:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For production mobile web export, set `EXPO_PUBLIC_API_URL` to the deployed Next.js backend origin. The mobile app appends `/api/mobile` automatically.

### 4. Run Database Migrations

```bash
npm run --workspace=estately-web db:migrate
```

### 5. Seed The Database

```bash
npm run --workspace=estately-web db:seed
```

For the large performance dataset:

```bash
npm run --workspace=estately-web db:load-test
```

### 6. Start The Web App

```bash
npm run --workspace=estately-web dev
```

The web app runs at:

```text
http://localhost:3000
```

### 7. Start The Mobile App

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile start
```

Run Expo Web:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web
```

Local mobile API URL notes:

- iOS simulator and Expo Web can usually use `http://localhost:3000`.
- Android emulator usually needs `http://10.0.2.2:3000`.
- Physical devices must use your computer's LAN IP, for example `http://192.168.1.20:3000`.

## Environment Variables

Required backend variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

Common optional backend variables:

- `R2_PUBLIC_URL`
- `R2_URL`

Required mobile variable:

- `EXPO_PUBLIC_API_URL`

No real secrets should be committed to the repository.

## Deployment Notes

### Web / Backend

Deploy `estately-web` to Netlify, Vercel, or another platform that supports Next.js.

Configure production environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL` if serving R2 assets from a public domain

Typical build command:

```bash
npm run --workspace=estately-web build
```

Typical start command:

```bash
npm run --workspace=estately-web start
```

### Mobile Web Export

The mobile app can be exported as a static web app and hosted separately.

Run locally:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web
```

Export for production:

```bash
EXPO_PUBLIC_API_URL=https://your-deployed-backend.example.com npm run --workspace=@estately/mobile export:web
```

The export output is generated at:

```text
apps/mobile/dist
```

For Netlify:

- Base directory: `apps/mobile`
- Build command: `npm run export:web`
- Publish directory: `dist`
- Environment variable: `EXPO_PUBLIC_API_URL=https://your-deployed-backend.example.com`

## Useful Commands

```bash
# Install all workspace dependencies
npm install

# Run the web app
npm run --workspace=estately-web dev

# Run the mobile app
npm run --workspace=@estately/mobile start

# Run Expo Web
npm run --workspace=@estately/mobile web

# Export mobile web build
npm run --workspace=@estately/mobile export:web

# Run web migrations
npm run --workspace=estately-web db:migrate

# Seed database
npm run --workspace=estately-web db:seed

# Create/verify load-test data
npm run --workspace=estately-web db:load-test

# Verify database counts
npm run --workspace=estately-web db:verify
```

## Project Review Checklist

- Web app supports property browsing, details, filters, favorites, inquiries, image uploads, and dashboards.
- Mobile app supports auth, browsing, details, search, favorites, inquiries, and profile.
- Mobile REST API is protected with bearer tokens where needed.
- Database contains at least 10,000 property records.
- Common filters and sorts use indexed database fields.
- Expo mobile app can be exported for static web hosting.
- Demo credentials are available for admin and regular user testing.
