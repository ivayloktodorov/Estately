# Final QA Report

Date: 2026-05-25

## Reviewer URLs

- Web app / backend: `https://estatelybg.netlify.app`
- Mobile web app: `https://estatelybg-mobile.netlify.app`
- Mobile API base: `https://estatelybg.netlify.app/api/mobile`
- Reviewer hub: `/softuni-exam`

## Demo Accounts

- User: `softuni_user@estately.com` / `pass123`
- Admin: `softuni_admin@estately.com` / `pass123`
- SoftUni Exam one-click buttons create or refresh the demo accounts and redirect to the correct dashboard.

## Final QA Path

1. Guest: open homepage, `/sale`, `/rent`, property details, `/register`, and `/login`.
2. User: sign in from `/softuni-exam`, check dashboard, favorites, add property, edit own property, upload images, send inquiry, make offer, messages, notifications, and logout.
3. Admin: sign in from `/softuni-exam`, check admin dashboard, property moderation, user management, messages, approve/reject property, edit user, and logout.
4. Mobile web: open the mobile URL, check property list, property details, login, favorites, and profile.

## Mobile API Verification

- `GET https://estatelybg.netlify.app/api/mobile/properties`: passed with published property results and pagination.
- `GET https://estatelybg.netlify.app/api/mobile/properties/23`: passed with image, EUR-compatible price data, title, address, description, beds, baths, area, and gallery data.
- `POST https://estatelybg.netlify.app/api/mobile/auth/login`: passed for `softuni_user@estately.com` / `pass123`.
- Authenticated `GET /api/mobile/me`: passed with the SoftUni user profile.
- Authenticated `GET /api/mobile/favorites`: passed with an empty-state-compatible response.

## Hardening Changes

- Visible EN/BG language switcher was removed from the header and mobile menu for final submission.
- UI locale is forced to English while the i18n provider, dictionaries, and translation files remain in place.
- Public debug/test upload surfaces were removed: `/test-r2` and `/api/test-r2-upload`.
- Required debug routes are absent from the final app surface: `/api/debug/property/[id]` and `/property-debug-page/[id]`.
- Temporary middleware request logging was removed.

## Requirement Coverage

- Authentication: registration, login, logout, httpOnly JWT web sessions, bearer-token mobile API.
- Roles: `user`, `admin`, and `moderator` role support with admin route protections.
- Property CRUD: user create/edit/delete own listings; admin moderation and management.
- Database: Neon PostgreSQL with Drizzle schema, migrations, seed scripts, and 10,000+ record load-test script.
- Search/filter/pagination: public listing pages and mobile API support server-side filtering and pagination.
- File upload/storage: property image upload flow with Cloudflare R2 support.
- Mobile app: Expo app and web export via `apps/mobile`.
- REST/mobile API: `/api/mobile` auth, properties, favorites, and inquiries.
- Responsive UI: desktop and mobile web layouts plus Expo mobile UI.
- Deployment: Netlify-ready web and mobile deployment docs.
- Documentation: README, deployment, local setup, API, architecture, schema, requirements, compliance, and QA docs.
- GitHub commits: conventional commit workflow documented; final commit history should be checked before submission.

## Known Limitations

- Bulgarian translations remain in the repository but the visible switcher is intentionally hidden for review stability.
- R2 should be verified through the real add/edit property image upload workflow in the deployed environment.
- Seed and load-test scripts are intended for demo/review databases, not long-lived production data.
- Production mobile export must be built with `EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app`.
- Mobile UI is intentionally focused on core review flows: browse, search, details, login/register, favorites, profile, and logout.

## Final Checklist

- [x] SoftUni Exam page remains available.
- [x] Language switcher hidden; default UI language English.
- [x] Public debug/test upload routes removed.
- [x] Guest, user, admin, and mobile review paths documented.
- [x] Requirement coverage documented.
- [x] Production URLs and demo accounts documented.
- [x] Mobile production API connection verified.
- [x] Mobile core flows and empty/error/loading states reviewed.

## Final Build Verification

- `npm run --workspace=estately-web lint`: passed.
- `npm run --workspace=estately-web build`: passed.
- `npm run --workspace=@estately/mobile typecheck`: passed.
- `EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app npm run mobile:export-web`: passed; Expo exported `apps/mobile/dist`.
