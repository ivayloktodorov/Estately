# Estately Local Development Setup

This guide explains how to clone, configure, seed, and run Estately locally for project review.

## 1. Prerequisites

Install or create:

- Node.js 20 or newer
- npm 10 or newer
- Git
- Neon account and PostgreSQL database
- Cloudflare account and R2 bucket for image uploads
- Expo CLI through `npx expo` or the npm workspace scripts

Check versions:

```bash
node --version
npm --version
git --version
```

## 2. Clone Repository

```bash
git clone <repository-url>
cd Estately
```

Use the actual repository URL provided for review.

## 3. Install Dependencies

Install all workspace dependencies from the repository root:

```bash
npm install
```

This installs dependencies for:

- `estately-web`
- `apps/mobile`
- other configured workspaces

## 4. Environment Variables

Create local environment files and never commit real secrets.

Recommended locations:

- Root `.env`
- `estately-web/.env.local`
- `apps/mobile/.env.local`

Backend variables:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret

R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
```

Mobile variable:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For a physical device, `EXPO_PUBLIC_API_URL` must use your computer's LAN IP instead of `localhost`, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
```

## 5. Database Setup

1. Create a Neon account at `https://neon.tech`.
2. Create a PostgreSQL project/database.
3. Copy the connection string from the Neon dashboard.
4. Set it as `DATABASE_URL` in your local environment.

The web app and scripts load `DATABASE_URL` from the root `.env`, root `.env.local`, `estately-web/.env`, or `estately-web/.env.local`.

## 6. Database Migration

Run migrations from the repository root:

```bash
npm run --workspace=estately-web db:migrate
```

What it does:

- Applies Drizzle migration files from `estately-web/src/drizzle`.
- Creates or updates database tables, columns, foreign keys, and indexes.

Generate a new migration after schema edits:

```bash
npm run --workspace=estately-web db:generate
```

What it does:

- Compares the Drizzle schema with migration history.
- Generates a new migration file in `estately-web/src/drizzle`.

For normal review setup, run `db:migrate`. You only need `db:generate` when changing schema.

## 7. Database Seed

Seed sample users, cities, properties, favorites, and messages:

```bash
npm run --workspace=estately-web db:seed
```

Seed or verify the larger scalability dataset:

```bash
npm run --workspace=estately-web db:load-test
```

What the seed data includes:

- Sample admin and regular users
- Sample cities
- Sample property listings
- Favorites
- Property inquiry messages
- 10,000+ property records for scalability testing through `db:load-test`

Verify database counts:

```bash
npm run --workspace=estately-web db:verify
```

## 8. Running Web App

Start the Next.js web app:

```bash
npm run --workspace=estately-web dev
```

Local URL:

```text
http://localhost:3000
```

Demo credentials:

```text
Admin:
admin@estately.com / pass123

User:
john@gmail.com / pass123
```

## 9. Running Mobile App

Start the Expo mobile app:

```bash
npm run mobile
```

Equivalent direct command:

```bash
cd apps/mobile
npx expo start
```

Make sure the backend is running first and `EXPO_PUBLIC_API_URL` points to the backend origin.

Mobile API URL notes:

- iOS simulator: `http://localhost:3000`
- Android emulator: `http://10.0.2.2:3000`
- Physical device: your computer's LAN IP, such as `http://192.168.1.20:3000`

## 10. Running Expo Web

Run the mobile app in web mode:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web
```

Equivalent direct command:

```bash
cd apps/mobile
EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo start --web
```

Expo Web usually opens at a localhost port printed by the Expo CLI.

## 11. Troubleshooting

### Issue: Cannot connect to database

Possible causes:

- `DATABASE_URL` is missing.
- `DATABASE_URL` is invalid or expired.
- Neon database is paused or unavailable.
- Migrations have not been executed.

Try:

```bash
npm run --workspace=estately-web db:migrate
npm run --workspace=estately-web db:verify
```

### Issue: Mobile app cannot reach API

Possible causes:

- Backend is not running on port 3000.
- `EXPO_PUBLIC_API_URL` is incorrect.
- `localhost` is used on a physical device.
- Android emulator needs `10.0.2.2` instead of `localhost`.

Try:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web
```

For a physical device, replace `localhost` with your local network IP.

### Issue: Cloudflare R2 upload fails

Possible causes:

- Invalid R2 credentials.
- Missing bucket name.
- Bucket permissions or public URL are not configured.
- Environment variable names do not match the app configuration.

Check:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

### Issue: Login fails with demo credentials

Possible causes:

- Seed script has not been run.
- Database points to a different environment.
- Existing users were deleted.

Try:

```bash
npm run --workspace=estately-web db:seed
```

### Issue: No properties appear

Possible causes:

- Seed script has not been run.
- Properties are unpublished.
- Database migrations are missing.

Try:

```bash
npm run --workspace=estately-web db:seed
npm run --workspace=estately-web db:load-test
```

## Quick Start

```bash
npm install
npm run --workspace=estately-web db:migrate
npm run --workspace=estately-web db:seed
npm run --workspace=estately-web dev
```

In another terminal:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web
```
