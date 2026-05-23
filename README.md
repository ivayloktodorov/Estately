# Estately

Estately is a Zillow-inspired full-stack real estate platform with a web app, mobile app, backend REST API, admin panel, property listings, favorites, inquiries, and image uploads.

The project is built as a TypeScript monorepo for reviewers to evaluate a complete web, mobile, backend, database, storage, and documentation workflow.

## 1. Project Overview

Estately lets users browse and search properties, view property details, save favorites, send inquiries, and manage their own listings. Admin users can review platform activity, manage users, and moderate properties.

Core project areas:

- Next.js web application and backend
- Expo React Native mobile application
- REST API for mobile clients
- Neon PostgreSQL database
- Drizzle ORM schema and migrations
- JWT authentication with bcrypt password hashing
- Cloudflare R2 property image uploads
- Reviewer documentation and project health pages

## 2. Live Demo / Local Demo

Final production deployment can be completed after project review. For local review:

```bash
npm install
npm run --workspace=estately-web dev
```

Open:

```text
http://localhost:3000
```

Reviewer shortcut:

```text
http://localhost:3000/demo
```

## 3. Demo Credentials

```text
Admin:
admin@estately.com / pass123

User:
john@gmail.com / pass123
```

## 4. Features

- Property browsing
- Property details
- Search and filters
- Pagination
- Favorites
- Property inquiries
- Property creation
- User dashboard
- Admin dashboard
- Admin user management
- Admin property moderation
- Mobile app
- REST API
- Cloudflare R2 uploads

## 5. Tech Stack

**Web:** Next.js, React, TypeScript, Tailwind CSS

**Backend:** Next.js API routes, Server Actions, JWT, bcrypt

**Database:** Neon PostgreSQL, Drizzle ORM, Drizzle migrations

**Mobile:** Expo, React Native, Expo Router

**Storage:** Cloudflare R2

## 6. Architecture Overview

The web app uses Next.js App Router pages, Server Components, Server Actions, and API routes. Form-driven web workflows such as login, registration, property management, favorites, inquiries, and admin operations run through server-side logic.

The mobile app uses the REST API under `/api/mobile`. Authenticated mobile requests send a bearer token.

The backend validates input, checks authorization, and uses Drizzle ORM to read and write data in Neon PostgreSQL. Property images are uploaded to Cloudflare R2 and stored in the database as image URLs.

## 7. Monorepo Structure

```text
Estately/
├── estately-web/                 # Next.js web app, backend API, Server Actions
│   ├── app/                      # Pages, docs, dashboard, admin, API routes
│   ├── components/               # Reusable web UI and property components
│   ├── lib/                      # Auth, admin, properties, favorites, inquiries
│   ├── services/                 # Cloudflare R2 storage services
│   ├── scripts/                  # Migrate, seed, verify, load-test scripts
│   ├── src/db/schema/            # Drizzle database schema
│   └── src/drizzle/              # Drizzle migrations
├── apps/mobile/                  # Expo React Native app
│   ├── app/                      # Expo Router screens
│   ├── components/               # Mobile UI components
│   ├── hooks/                    # Mobile hooks
│   ├── services/                 # REST API client services
│   └── types/                    # Mobile TypeScript types
├── docs/                         # Root documentation assets
├── AGENTS.md                     # AI agent/project instructions
├── package.json                  # npm workspace config
└── README.md
```

Note: this repository uses `estately-web/` for the web app rather than `apps/web/`.

## 8. Database Schema

Main tables:

- `users`: accounts, roles, bcrypt password hashes, profile data, timestamps
- `properties`: property listings, pricing, location, status, owner, metadata
- `property_images`: additional property images
- `favorites`: saved properties by user
- `property_messages`: property inquiry messages
- `cities`: supported city metadata

The schema includes relationships for users to properties, properties to images, users to favorites, properties to favorites, users to messages, and properties to messages.

Database documentation:

- Local file: [docs/database-schema.md](./docs/database-schema.md)
- Web page: `/docs/database-schema`

## 9. Authentication

Estately supports registration, login, logout, role-based access, protected web routes, and bearer-token mobile API access.

Implementation notes:

- Passwords are hashed with bcrypt.
- JWT is used for authenticated sessions.
- Web routes are protected with server-side checks.
- Admin routes require the `admin` role.
- Mobile API requests use `Authorization: Bearer <token>`.
- Sensitive fields such as `passwordHash` are not returned in API responses.

## 10. REST API

The mobile REST API is served by the Next.js backend under `/api/mobile`.

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

API docs:

- Web page: `/docs/api`

## 11. Web App Screens

- Home
- Login
- Register
- Properties
- Property Details
- Favorites
- Dashboard
- Add Property
- Edit Property
- Inquiries
- Admin Dashboard
- Admin Users
- Admin Properties
- Documentation pages

## 12. Mobile App Screens

- Login
- Register
- Home / Property List
- Search
- Property Details
- Favorites
- Profile

## 13. Scalability

Estately includes scalability support for large listing datasets:

- 10,000 property records supported by the load-test script
- Server-side pagination
- Database-level search and filtering
- Indexes for common filter and sort fields
- Performance verification scripts

Useful scripts:

```bash
npm run --workspace=estately-web db:load-test
npm run --workspace=estately-web db:verify
```

## 14. File Storage

Property image uploads are integrated with Cloudflare R2.

Storage coverage:

- Cloudflare R2 client service
- Property image upload workflow
- Image URL persistence in the database
- R2 smoke test page and API route

Run the R2 smoke test locally from:

```text
http://localhost:3000/test-r2
```

## 15. Documentation Links

When the web app is running locally, these pages are available:

- `/demo`
- `/docs/api`
- `/docs/architecture`
- `/docs/database-schema`
- `/docs/requirements`
- `/docs/local-setup`
- `/docs/deployment`
- `/docs/project-health`
- `/docs/production-readiness`
- `/docs/compliance`

## 16. Local Development

Prerequisites:

- Node.js 20+
- npm 10+
- Neon PostgreSQL database
- Cloudflare R2 bucket for upload testing

Install dependencies:

```bash
npm install
```

Configure environment variables in local env files. Do not commit real secrets.

Required web/backend variables:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
```

Required mobile variable:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Run migrations and seed data:

```bash
npm run --workspace=estately-web db:migrate
npm run --workspace=estately-web db:seed
```

Start the web app:

```bash
npm run --workspace=estately-web dev
```

Start the mobile app:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile start
```

Run Expo Web:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web
```

Full local setup guide:

- `/docs/local-setup`

## 17. Deployment Notes

Deployment is documented and can be completed after project review.

Required production web/backend variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

Required production mobile variable:

- `EXPO_PUBLIC_API_URL`

Production notes:

- Deploy `estately-web` to a Next.js-compatible host.
- Run Drizzle migrations against the production Neon database.
- Configure Cloudflare R2 credentials in the hosting provider.
- Set `EXPO_PUBLIC_API_URL` to the deployed backend origin for mobile builds.
- Verify image uploads with the R2 smoke test.

Deployment guide:

- `/docs/deployment`

## 18. Assignment Requirements Coverage

- [x] Backend + Web + Mobile
- [x] Neon PostgreSQL + Drizzle
- [x] JWT auth + bcrypt
- [x] Admin panel
- [x] 10+ web screens
- [x] 5+ mobile screens
- [x] REST API
- [x] 10,000 records support
- [x] Pagination
- [x] Object storage
- [x] Documentation
- [x] AGENTS.md

Additional reviewer pages:

- `/docs/project-health`
- `/docs/production-readiness`
- `/docs/compliance`
- `/demo`
