# Estately Deployment Guide

This guide explains how to deploy the Estately Next.js web/backend app and the Expo mobile web export. It is documentation only; it does not perform deployment.

## 1. Deployment Overview

Estately has three production infrastructure pieces:

- **Next.js web app:** contains the public website, dashboards, admin panel, Server Actions, and backend REST APIs.
- **Expo mobile app:** can be exported as a static web app and deployed separately.
- **Neon PostgreSQL:** production database.
- **Cloudflare R2:** object storage for uploaded property images.

The mobile app communicates with the deployed Next.js backend through `/api/mobile` endpoints.

## 2. Web App Deployment

Deploy `estately-web` to Netlify, Vercel, or another hosting platform that supports Next.js.

### Build settings

From the repository root:

```bash
npm run web:build
```

From inside `estately-web`:

```bash
npm run build
```

Expected Next.js build output:

```text
estately-web/.next
```

### Netlify

1. Connect the GitHub repository to Netlify.
2. Use the committed `netlify.toml`, or set these values in the Netlify UI:

```text
Base directory:
estately-web

Build command:
npm run build

Publish directory:
.next
```

3. Let Netlify detect Next.js. The Netlify Next runtime converts App Router pages, API routes, and middleware automatically.
4. Add production environment variables in the Netlify dashboard.
5. Deploy.

### Vercel

1. Import the GitHub repository into Vercel.
2. Select the `estately-web` project/root directory.
3. Use the default Next.js build settings:

```text
Framework preset:
Next.js

Build command:
npm run build

Output:
.next
```

4. Add production environment variables in the Vercel dashboard.
5. Deploy.

## 3. Environment Variables

Required production variables for the Next.js web/backend app:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=https://your-deployed-estately-web-url.com

R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
```

Optional if using a public R2 custom domain:

```env
R2_PUBLIC_URL=https://your-public-r2-domain.example.com
R2_URL=https://custom-r2-endpoint.example.com
```

Do not commit real production secrets.

## 4. Neon Production Database

1. Create a Neon project or production branch.
2. Copy the production connection string.
3. Set it as `DATABASE_URL` in the web app deployment environment.
4. Run migrations against production:

```bash
DATABASE_URL=postgresql://... npm run --workspace=estately-web db:migrate
```

5. Seed production only if needed:

```bash
DATABASE_URL=postgresql://... npm run --workspace=estately-web db:seed
```

6. Add or verify the scalability dataset only when appropriate:

```bash
DATABASE_URL=postgresql://... npm run --workspace=estately-web db:load-test
```

## 5. Cloudflare R2 Configuration

1. Create a Cloudflare R2 bucket.
2. Create an R2 API token or access key pair with permission to read/write objects.
3. Configure these variables in the web deployment:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

4. Configure public access or a custom public domain if images must be served directly.
5. Verify upload from the web app property image workflow or test upload route.

## 6. Expo Mobile Web Export

The mobile app is deployed separately as a static Expo Web export.

Set the mobile app API URL to the deployed web/backend origin:

```env
EXPO_PUBLIC_API_URL=https://your-deployed-estately-web-url.com
```

Run the export:

```bash
EXPO_PUBLIC_API_URL=https://your-deployed-estately-web-url.com npm run mobile:export-web
```

The generated output is:

```text
apps/mobile/dist
```

Deploy that folder to Netlify or another static hosting platform.

### Netlify Static Mobile Deployment

If deploying from the monorepo:

- Base directory: `apps/mobile`
- Build command: `npm run export:web`
- Publish directory: `dist`
- Environment variable: `EXPO_PUBLIC_API_URL=https://your-deployed-estately-web-url.com`

Do not export mobile web without `EXPO_PUBLIC_API_URL`; production builds intentionally fail if this value is missing so localhost is not baked into the static output.

## 7. Mobile API URL Configuration

Development:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Production:

```env
EXPO_PUBLIC_API_URL=https://your-deployed-estately-web-url.com
```

The mobile app appends `/api/mobile` automatically, so the value should normally be the backend origin.

## 8. Post-deployment Verification

After deployment, verify:

- Homepage loads.
- Login works.
- Register works.
- Properties page loads.
- Property details page loads.
- Dashboard redirects when logged out and loads when logged in.
- Admin redirects/rejects non-admins and loads for an admin.
- Docs pages load, including `/docs/deployment` and `/docs/final-qa-report`.
- Mobile REST API works, for example `GET /api/mobile/properties`.
- Protected REST endpoints return `401` without a Bearer token.
- Invalid REST requests return safe `400` errors.
- Mobile web export loads.
- Mobile login works against the deployed backend.
- Image upload works.
- Uploaded images load from R2/public URL.
- Admin login works.
- Admin dashboard loads.

Demo credentials:

```text
Admin:
admin@estately.com / pass123

User:
john@gmail.com / pass123
```

## 9. Common Deployment Issues

### Issue: API works locally but fails in production

Possible causes:

- Missing production environment variables.
- Incorrect `DATABASE_URL`.
- Database migrations were not run.
- Mobile app points to the wrong backend URL.
- CORS or API URL mismatch.

### Issue: Mobile app cannot login

Possible causes:

- `EXPO_PUBLIC_API_URL` points to the wrong backend.
- Backend deployment URL is unavailable.
- Login endpoint is failing due to missing `JWT_SECRET`.
- Production database has not been seeded with demo users.

### Issue: R2 upload fails

Possible causes:

- Invalid R2 credentials.
- Bucket name mismatch.
- R2 token does not have write permission.
- Public URL/custom domain is not configured.

### Issue: Properties do not appear

Possible causes:

- Production database is empty.
- Seed script was not run.
- Listings are unpublished.
- Migration state does not match the schema.

### Issue: Admin pages are inaccessible

Possible causes:

- User role is not `admin`.
- JWT secret changed and existing sessions are invalid.
- Production database does not contain the demo admin user.
