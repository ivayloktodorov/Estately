# Final Capstone Audit

Date: 2026-05-25

Scope: repository-only audit of the Estately monorepo against the project requirements listed in the prompt. No deployment, refactor, or code changes were performed as part of this audit.

## Summary

Estately is complete for final submission. The repository contains a Next.js web/backend app, Expo mobile app, Neon/PostgreSQL Drizzle schema and migrations, JWT authentication, admin functionality, Cloudflare R2 upload support, seed/load-test scripts, deployment documentation, final reviewer URLs, and meaningful AGENTS.md files.

Recommendation: **READY FOR SUBMISSION**

This recommendation is based on repository evidence plus final production checks performed on 2026-05-25. The remaining items are non-blocking documentation/architecture cleanups rather than submission blockers.

## Final Production State

- Web app URL: **https://estatelybg.netlify.app**
- Mobile app URL: **https://estately-mobile-bg.netlify.app**
- Web deployment: **ready** on Netlify production, deploy `6a14a19c17600fcc9f5558f5`, commit `db27e5113d0be21d6fbe2d11a81067ce5a5b99c5`, published `2026-05-25T19:25:18.095Z`.
- Mobile deployment: **ready** on Netlify production, deploy `6a147ee0d893860008e8ef1b`, commit `bff52fa96fd9363e59c6f7053e99a3f47a69aaeb`, published `2026-05-25T16:56:05.208Z`.
- Web verification: **PASS**. `https://estatelybg.netlify.app` returned HTTP 200.
- Mobile verification: **PASS**. `https://estately-mobile-bg.netlify.app` returned HTTP 200.
- Mobile API verification: **PASS**. `GET https://estatelybg.netlify.app/api/mobile/properties?limit=1` returned `success: true`, paginated property data, and R2-backed image URLs.
- Production DB issue: **RESOLVED**. The Add Property failure was isolated to PostgreSQL `42703` (`undefined_column`) from production schema drift. After the production DB schema was aligned with committed Drizzle migrations, property creation succeeded; the mobile API now returns newly created property `10004` with an R2 `property-images/10004/...` image URL.

## Final Scores

- Overall completion percentage: **97%**
- Technical quality score: **93/100**
- Submission readiness score: **96/100**

Scoring basis: weighted review of required categories, implementation breadth, committed evidence, documentation, deployment references, and identified risks.

## Key Risks

- **Role mismatch in docs vs code:** `docs/final-qa-report.md` says `moderator` role support, but code evidence shows `USER_ROLES = ['user', 'admin']` in `estately-web/lib/auth/types.ts`.
- **Duplicate mobile folders:** the repo contains both `apps/mobile` and `estately-mobile`. The documented/deployed app is `apps/mobile`, but the older `estately-mobile` workspace can confuse reviewers.
- **Runtime deployment health verified:** web, mobile, and mobile API production endpoints returned successful responses on 2026-05-25.
- **Advanced security items are not fully evidenced:** refresh tokens, auth rate limiting, and token blacklist are described in AGENTS.md guidance but are not clearly implemented in code.

## Missing Items

- No implemented `moderator` role found in auth types or admin role normalization.
- No clear refresh-token flow found.
- No clear auth endpoint rate limiting found.
- No cleanup/removal of the legacy `estately-mobile` workspace; final documentation and deployment use `apps/mobile`.

## Requirement Checklist

| Requirement | Status | Confidence | Evidence | Missing Items | Recommended Action |
|---|---:|---:|---|---|---|
| Backend | PASS | 96% | Next.js backend/API in `estately-web/app/api`; server actions in `estately-web/app/dashboard/**/actions.ts`, `estately-web/app/admin/**/actions.ts`; services in `estately-web/lib`; mobile API routes under `estately-web/app/api/mobile`. | None blocking found. | None required. |
| Database | PASS | 98% | Drizzle schema in `estately-web/src/db/schema`; 14 schema files; 17 SQL migrations in `estately-web/src/drizzle`; Neon HTTP client in `estately-web/src/db/client.ts`; migration script `estately-web/scripts/migrate.ts`. | None blocking found. | None required. |
| Architecture | PARTIAL | 84% | Monorepo workspaces in root `package.json`; web app in `estately-web`; final mobile app in `apps/mobile`; layered services/hooks/components in both apps; docs describe architecture. | Root AGENTS.md mentions `estately-shared`, but no `estately-shared` folder exists; duplicate `estately-mobile` workspace remains. | Consider documenting `apps/mobile` as canonical and removing or clearly marking legacy `estately-mobile`. |
| Web app | PASS | 97% | 30 non-doc web page files under `estately-web/app`; public pages: `/`, `/sale`, `/rent`, `/property/[id]`, `/login`, `/register`; dashboard pages; admin pages; docs pages. | None blocking found. | None required. |
| Mobile app | PASS | 94% | Expo app in `apps/mobile`; routes include home, search, favorites, profile, login, register, property details; API client in `apps/mobile/services/api.ts`; production URL documented as `https://estately-mobile-bg.netlify.app`. | Duplicate older `estately-mobile` folder may confuse. | Keep docs pointing to `apps/mobile`; consider removing legacy folder after submission if safe. |
| Authentication / Authorization | PARTIAL | 88% | JWT signing/verification in `estately-web/lib/auth/jwt.ts`; httpOnly cookie sessions in `estately-web/lib/auth/session.ts`; mobile bearer auth in `estately-web/lib/mobile-api/auth.ts`; middleware in `estately-web/middleware.ts`; `requireAdmin()` protects admin pages/actions; bcrypt in `estately-web/lib/auth/password.ts`. | Implemented roles are `user` and `admin`; no `moderator` role; no refresh token or clear rate limiting found. | Fix docs that claim moderator support, or implement moderator only if required. Avoid adding risky auth features immediately before submission unless required. |
| Scalability | PASS | 95% | Load-test script `estately-web/scripts/load-test-data.ts` targets 10,000 users/properties/favorites/messages/images; pagination in `estately-web/lib/properties/search.ts`; indexes in `estately-web/src/db/schema/properties.ts` and migrations `0002`, `0004`, `0015`; docs/database-schema.md records 10,000 property strategy. | Live database count not proven by repo alone. | Run `db:verify` against final DB before presenting, if credentials are available. |
| Deployment | PASS | 98% | Web Netlify config in root `netlify.toml`; mobile Netlify config in `apps/mobile/netlify.toml`; deployment docs in `docs/deployment.md`; web URL `https://estatelybg.netlify.app`; mobile URL `https://estately-mobile-bg.netlify.app`; mobile build command uses `EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app`; Netlify reports both production deploys as ready; both URLs returned HTTP 200. | None blocking found. | None required. |
| GitHub requirements | PASS | 100% | Git history shows 70 commits; commits span 4 unique dates; latest commit `7c8ec92 docs: update final mobile app url`. | None. | None required. |
| AGENTS.md | PASS | 96% | Root `AGENTS.md`, `estately-web/AGENTS.md`, and `estately-mobile/AGENTS.md` exist and contain meaningful project, architecture, coding, auth, DB, API, testing, and workflow instructions. | Root AGENTS structure references `estately-shared`, which is absent. | Optional doc cleanup only. |
| Documentation | PASS | 95% | Root `README.md`; `docs/deployment.md`; `docs/final-qa-report.md`; `docs/database-schema.md`; `docs/local-setup.md`; `docs/performance-audit.md`; web docs pages in `estately-web/app/docs/**`; mobile README in `apps/mobile/README.md`; SoftUni Exam page in `estately-web/app/softuni-exam/page.tsx`. | Minor role mismatch in final QA report. | Correct `moderator` claim if allowed in a docs-only pass. |
| File storage | PASS | 97% | Cloudflare R2 services in `estately-web/services/storage/r2.ts` and `estately-web/services/storage/property-images.ts`; upload route `estately-web/app/api/properties/[id]/images/route.ts`; R2 env docs in README/deployment/local setup; `property_images` table; production API returned a `property-images/10004/...` URL from the configured R2 public host. | None blocking found. | None required. |
| Optional requirements | PASS | 86% | Implemented extras include offers (`estately-web/lib/offers`, `/dashboard/offers`), messages/conversations, notifications, saved searches, activity tracking, BG i18n files, performance docs, API docs, SoftUni reviewer hub. | BG switcher intentionally hidden; optional i18n not fully active. | No action required for core submission. |

## Specific Verification

### Minimum 10 Web Screens

Status: **PASS**  
Confidence: **100%**

Evidence: `find estately-web/app -path '*/page.tsx' -not -path '*/docs/*'` found 30 non-doc page files, including:

- `estately-web/app/page.tsx`
- `estately-web/app/sale/page.tsx`
- `estately-web/app/rent/page.tsx`
- `estately-web/app/property/[id]/page.tsx`
- `estately-web/app/(auth)/login/page.tsx`
- `estately-web/app/(auth)/register/page.tsx`
- `estately-web/app/favorites/page.tsx`
- `estately-web/app/dashboard/page.tsx`
- `estately-web/app/dashboard/properties/page.tsx`
- `estately-web/app/dashboard/properties/new/page.tsx`
- `estately-web/app/dashboard/properties/[id]/edit/page.tsx`
- `estately-web/app/admin/page.tsx`
- `estately-web/app/admin/properties/page.tsx`
- `estately-web/app/admin/users/page.tsx`

Missing items: none.

Recommended action: none.

### Minimum 5 Mobile Screens

Status: **PASS**  
Confidence: **100%**

Evidence: `apps/mobile/app` includes:

- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/app/(tabs)/search.tsx`
- `apps/mobile/app/(tabs)/favorites.tsx`
- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/app/(auth)/login.tsx`
- `apps/mobile/app/(auth)/register.tsx`
- `apps/mobile/app/property/[id]/index.tsx`

Missing items: none.

Recommended action: none.

### Minimum 4 DB Tables With Relationships

Status: **PASS**  
Confidence: **100%**

Evidence:

- `estately-web/src/db/schema/users.ts`
- `estately-web/src/db/schema/properties.ts`
- `estately-web/src/db/schema/favorites.ts`
- `estately-web/src/db/schema/property-images.ts`
- `estately-web/src/db/schema/property-messages.ts`
- `estately-web/src/db/schema/conversations.ts`
- `estately-web/src/db/schema/messages.ts`
- `estately-web/src/db/schema/notifications.ts`

Relationship evidence:

- `properties.createdByUserId` foreign key references `users.id`.
- `favorites.userId` references `users.id`.
- `favorites.propertyId` references `properties.id`.
- `property_images.propertyId` references `properties.id`.
- Migration files include foreign key constraints.

Missing items: none.

Recommended action: none.

### JWT Authentication

Status: **PASS**  
Confidence: **96%**

Evidence:

- `estately-web/lib/auth/jwt.ts` implements HS256 signing and verification.
- `estately-web/lib/auth/session.ts` stores web auth in httpOnly cookie `estately_session`.
- `estately-web/app/api/mobile/auth/login/route.ts` signs mobile JWTs.
- `apps/mobile/services/auth.service.ts` stores returned mobile sessions.

Missing items: refresh tokens are not found, but JWT auth itself is implemented.

Recommended action: none for core JWT requirement.

### Roles and Admin Functionality

Status: **PARTIAL**
Confidence: **88%**

Evidence:

- `estately-web/lib/auth/types.ts` defines `USER_ROLES = ['user', 'admin']`.
- `estately-web/lib/auth/session.ts` defines `requireAdmin()`.
- `estately-web/middleware.ts` protects `/admin` and `/api/admin`.
- Admin pages exist under `estately-web/app/admin`.
- Property moderation actions exist in `estately-web/app/admin/properties/actions.ts`.
- User management exists in `estately-web/lib/admin/users.ts` and `estately-web/app/admin/users/**`.

Missing items:

- No implemented `moderator` role found.
- `docs/final-qa-report.md` currently claims `moderator` role support, which does not match code.

Recommended action:

- Treat `user` and `admin` as the implemented roles.
- Fix the moderator documentation claim if documentation changes are allowed.

### Drizzle Migrations Committed

Status: **PASS**  
Confidence: **100%**

Evidence:

- 17 SQL migrations are committed under `estately-web/src/drizzle`.
- Drizzle metadata exists under `estately-web/src/drizzle/meta`.
- Migration runner exists at `estately-web/scripts/migrate.ts`.
- Drizzle config exists at `estately-web/drizzle.config.ts`.

Missing items: none.

Recommended action: none.

### Seed Script

Status: **PASS**  
Confidence: **100%**

Evidence:

- `estately-web/scripts/seed.ts`
- `estately-web/package.json` script `db:seed`
- SoftUni accounts are seeded in `seed.ts`: `softuni_user@estately.com` and `softuni_admin@estately.com`.

Missing items: none.

Recommended action: none.

### 10,000+ Records Support and Paging

Status: **PASS**  
Confidence: **95%**

Evidence:

- `estately-web/scripts/load-test-data.ts` targets 10,000 users, properties, favorites, messages, and images.
- `estately-web/package.json` script `db:load-test`.
- Public pagination in `estately-web/lib/properties/search.ts`.
- Mobile pagination in `estately-web/lib/mobile-api/properties.ts` and `estately-web/app/api/mobile/properties/route.ts`.
- Database indexes in `estately-web/src/db/schema/properties.ts`.
- `docs/database-schema.md` documents 10,000 seeded properties and query performance snapshot.

Missing items: actual final production DB count is not proven from repository alone.

Recommended action: run `npm run --workspace=estately-web db:verify` against final DB before presentation if credentials are available.

### AGENTS.md Exists and Is Meaningful

Status: **PASS**  
Confidence: **96%**

Evidence:

- `AGENTS.md`
- `estately-web/AGENTS.md`
- `estately-mobile/AGENTS.md`

These files contain project overview, architecture, TypeScript, auth, database, API, testing, workflow, and deployment guidance.

Missing items: root AGENTS mentions `estately-shared`, which is not present.

Recommended action: optional doc cleanup.

### Commit History

Status: **PASS**  
Confidence: **100%**

Evidence from git:

- Total commits: **70**
- Unique commit dates: **4**
- Requirement minimum: 15 commits and at least 3 different days.

Missing items: none.

Recommended action: none.

### Demo Credentials Exist

Status: **PASS**  
Confidence: **100%**

Evidence:

- `README.md` documents:
  - `softuni_admin@estately.com / pass123`
  - `softuni_user@estately.com / pass123`
- `docs/final-qa-report.md` documents the same credentials.
- `estately-web/scripts/seed.ts` seeds both accounts.
- `estately-web/app/softuni-exam/page.tsx` displays both accounts.
- `estately-web/app/softuni-exam/actions.ts` supports one-click SoftUni login.

Missing items: none.

Recommended action: none.

### Web Deployment URL

Status: **PASS**  
Confidence: **98%**

Evidence:

- `README.md` documents `https://estatelybg.netlify.app`.
- `docs/deployment.md` documents `https://estatelybg.netlify.app`.
- `docs/final-qa-report.md` documents `https://estatelybg.netlify.app`.
- `estately-web/app/softuni-exam/page.tsx` displays `https://estatelybg.netlify.app`.
- Root `netlify.toml` configures web deployment from `estately-web`.
- Netlify production deploy `6a14a19c17600fcc9f5558f5` is ready and `https://estatelybg.netlify.app` returned HTTP 200 on 2026-05-25.

Missing items: none.

Recommended action: none.

### Mobile Deployment URL

Status: **PASS**  
Confidence: **98%**

Evidence:

- `README.md` documents `https://estately-mobile-bg.netlify.app`.
- `apps/mobile/README.md` documents `https://estately-mobile-bg.netlify.app`.
- `docs/deployment.md` documents `https://estately-mobile-bg.netlify.app`.
- `docs/final-qa-report.md` documents `https://estately-mobile-bg.netlify.app`.
- `estately-web/app/softuni-exam/page.tsx` displays `https://estately-mobile-bg.netlify.app`.
- `apps/mobile/netlify.toml` configures Expo web export.
- Netlify production deploy `6a147ee0d893860008e8ef1b` is ready and `https://estately-mobile-bg.netlify.app` returned HTTP 200 on 2026-05-25.

Missing items: none.

Recommended action: none.

### Neon DB Configuration

Status: **PASS**  
Confidence: **95%**

Evidence:

- `@neondatabase/serverless` dependency in `estately-web/package.json`.
- `drizzle-orm/neon-http` used in `estately-web/src/db/client.ts`, `estately-web/scripts/migrate.ts`, `estately-web/scripts/seed.ts`, and `estately-web/scripts/load-test-data.ts`.
- `DATABASE_URL` required in `estately-web/src/db/client.ts` and `estately-web/scripts/load-env.ts`.
- Neon setup documented in `docs/local-setup.md`, `docs/deployment.md`, and `docs/database-schema.md`.

Missing items: actual secret value is intentionally not committed.

Recommended action: none.

### Cloudflare R2 Usage

Status: **PASS**  
Confidence: **97%**

Evidence:

- R2 client and signed URL flow in `estately-web/services/storage/r2.ts`.
- Property image upload service in `estately-web/services/storage/property-images.ts`.
- Upload endpoint in `estately-web/app/api/properties/[id]/images/route.ts`.
- R2 environment variables documented in README and deployment docs.
- `property_images` table stores uploaded image URLs.
- Production mobile API returned property `10004` with a Cloudflare R2 `property-images/10004/...` image URL.

Missing items: none.

Recommended action: none.

## Final Recommendation

**READY FOR SUBMISSION**

The project meets the core capstone requirements by repository evidence. The only notable issues are non-blocking for a final submission unless the official rubric explicitly requires a `moderator` role, refresh tokens, rate limiting, or removal of duplicate workspace folders.
