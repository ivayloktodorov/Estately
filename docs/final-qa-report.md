# Final QA Report

Date: 2026-05-24

## SoftUni Review Readiness

### Reviewer URLs

- Web app / backend: `https://estatelybg.netlify.app`
- Mobile web app: `https://estatelybg-mobile.netlify.app`
- Mobile API base compiled into Expo web: `https://estatelybg.netlify.app/api/mobile`

### Reviewer Accounts

- User: `softuni_user@estately.com` / `pass123`
- Admin: `softuni_admin@estately.com` / `pass123`
- One-click access: `/softuni-exam` includes `Test as User` and `Test as Admin` buttons that create the accounts if missing and redirect to the correct dashboard.

### Tested Flow

Recommended 5-10 minute review path:

1. Open `/softuni-exam`.
2. Browse `/sale` as a guest and open a published sale property.
3. Browse `/rent` as a guest and open a published rental property.
4. Use `Test as User`.
5. Save a favorite and confirm it appears in `/favorites`.
6. Send an inquiry from a property detail page and check `/dashboard/messages`.
7. Make an offer from a property detail page and check `/dashboard/offers`.
8. Add a property from `/dashboard/properties/new`; it should be pending moderation.
9. Use `Test as Admin`.
10. Approve or reject pending listings from `/admin/properties`.
11. Review user management from `/admin/users`.
12. Check seeded and newly created examples in `/dashboard/notifications` and `/dashboard/messages`.

### Demo Data Readiness

- Published sale properties: seeded by `npm run db:seed --workspace=estately-web`.
- Published rent properties: seeded by `npm run db:seed --workspace=estately-web`.
- Pending moderation property: `SoftUni Pending Review Apartment`.
- Demo user and admin: seeded and also auto-created by the SoftUni Exam login buttons.
- Offer/message/notification examples: the TypeScript seed script creates property inquiries, a pending demo offer, and reviewer notifications.

### Documentation Links Verified

- README: `/` project root `README.md`.
- API docs: `/docs/api`.
- Architecture docs: `/docs/architecture`.
- Database schema docs: `/docs/database-schema`.
- Local setup: `/docs/local-setup`.
- Deployment guide: `/docs/deployment`.
- Final QA report: `/docs/final-qa-report`.
- Requirements checklist: `/docs/requirements` and `/docs/compliance`.

### Known Limitations

- The existing `https://estatelybg.netlify.app` Netlify backend currently returns a database query error from `GET /api/mobile/properties`; the local configured database verifies successfully, so the deployed web/backend site must be checked for a stale or incorrect `DATABASE_URL`.
- Live R2 upload and mobile-device QA should be repeated in the final deployed environment with production credentials.
- The seed script is intended for review/demo databases; do not run it against production data unless the target database is disposable.

### Final Readiness Status

Ready for SoftUni review from the local/deployed review hub. A reviewer can start at `/softuni-exam`, use the visible credentials or one-click login buttons, follow the guided path, and reach all important documentation and role-specific workflows in 5-10 minutes.

## Final Security & Access Control Audit

### Tested Areas

- Authentication: invalid/missing session handling, protected page redirects, API auth responses, login/session DTO shape, logout/session clearing paths.
- Authorization: admin route middleware, server-side `requireAdmin()` checks, user-scoped profile/favorites/notifications/messages/offers/property edits.
- Admin access: listing moderation actions, user management actions, own-account delete/deactivate/demote safeguards.
- Upload security: avatar uploads, property image uploads, message attachments, file type and file size validation, R2 storage behavior.
- Sensitive data: password hash usage, JWT secret usage, R2 secret usage, API response DTOs, client bundle references.
- API safety: protected API matchers, mobile bearer-token auth, safe validation errors, user-scoped notification mutation.

### Issues Found

- Protected API paths such as `/api/profile`, `/api/notifications`, `/api/messages/attachments/:id`, and `/api/test-r2-upload` were handled by route-level auth but were missing from the middleware matcher, causing unauthenticated requests to receive redirects instead of consistent API auth handling.
- `/api/test-r2-upload` allowed unauthenticated upload attempts before route-level admin protection.
- Property image uploads could fall back to local filesystem storage when R2 was not configured.
- Mobile property details allowed `approved` but unpublished listings to be returned publicly.
- Favorite and inquiry paths checked moderation approval but did not consistently require `isPublished`.

### Fixes Applied

- Added missing protected API routes to the middleware matcher.
- Protected `/api/test-r2-upload` with `requireAdmin()`.
- Disabled local filesystem upload fallback by default; local fallback now requires non-production mode and `ALLOW_LOCAL_UPLOAD_FALLBACK=1`.
- Required both `moderationStatus === 'approved'` and `isPublished === true` for public/mobile property detail, favorite, and inquiry flows.
- Confirmed admin user deletion prevents deleting the acting admin account, and own deactivation is blocked.
- Confirmed message, attachment, notification, offer, favorite, and property edit operations are scoped by authenticated user ID or admin role server-side.

### Verification

- `npx tsc --noEmit -p estately-web/tsconfig.json` passed.
- `npm run --workspace=estately-web lint` passed with one existing warning on the `/test-r2` smoke page raw `<img>`.
- `npm run --workspace=estately-web build` passed.
- Black-box checks confirmed unauthenticated `/admin`, `/admin/properties`, and `/dashboard` redirect to login.
- Black-box checks confirmed unauthenticated `/api/admin/me` returns `401`.

### Remaining Risks

- The `/test-r2` page is still publicly viewable, but the upload API is admin-protected. It can be hidden or removed before a production launch if desired.
- Browser-level security testing with real authenticated regular/admin sessions should still be performed before final deployment.
- Mobile API CORS is intentionally broad for Expo/mobile development; tighten allowed origins if the production mobile/web deployment model permits it.
- Some route handlers still rely on route-level auth in addition to middleware. This is acceptable defense-in-depth, but future protected API routes must be added to the middleware matcher when consistent API auth responses are required.
