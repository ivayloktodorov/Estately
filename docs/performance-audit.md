# Estately Performance Audit

Date: 2026-05-24

## Measurement Setup

- Built production web app with `npm run --workspace=estately-web build`.
- Served production build locally with `next start -p 3100`.
- Captured route timing with `curl` using TTFB, total response time, HTTP status, and HTML/API payload size.
- Inspected `.next/static` for largest emitted JS/CSS/font assets.
- Browser waterfall/request count was not captured because Playwright is not installed in this workspace.

## Before Metrics

| Route | Status | TTFB | Total | Payload |
| --- | ---: | ---: | ---: | ---: |
| `/` | 200 | 0.722s | 0.724s | 113 KB |
| `/sale` | 200 | 0.321s | 0.322s | 95 KB |
| `/rent` | 200 | 0.313s | 0.315s | 97 KB |
| `/properties/1` | 200 | 0.009s | 0.158s | 37 KB |
| `/dashboard` | 307 | 0.032s | 0.032s | 24 B |
| `/admin/properties` | 307 | 0.002s | 0.002s | 33 B |
| `/login` | 200 | 0.007s | 0.007s | 32 KB |

Largest static assets before:

- `chunks/0~gj12laizhyq.js`: 227 KB
- `chunks/0rc~8p7fsg8m5.js`: 156 KB
- `chunks/0q_pw.ygbf~ny.js`: 118 KB
- `chunks/03~yq9q893hmn.js`: 113 KB
- `chunks/0rolrqd7il1sd.css`: 77 KB

## Issues Found

- Public property list queries selected full property rows even though cards only render card-level fields.
- Mobile property list API also selected full property rows, including fields not used by list cards.
- Notification list queries selected full notification rows for header/list views.
- Public listing/newest/trending/similar queries repeated DB work that is safe to cache briefly.
- Public property cards were client components, causing static card markup to participate in client hydration.
- Listing images used `next/image`, but no above-the-fold priority hints were provided.
- Public listing sort/filter paths had only single-column indexes, leaving common public filters/sorts without composite indexes.

## Fixes Applied

- Converted `components/ui/property-card.tsx` to a server component and kept `FavoriteButton` as the small client island.
- Added `imagePriority` support and applied eager priority only to the first two visible cards on home/listing/search result grids.
- Reduced public property list/similar/newest/trending selects to card fields plus map coordinates where needed.
- Added 60s cache for public paginated listings and newest listings.
- Added 300s cache for public similar/trending listings.
- Reduced mobile property list API responses to list fields only.
- Reduced notification reads to notification UI fields only.
- Added Drizzle schema indexes and migration `0015_public_listing_performance_indexes.sql` for common public listing filters/sorts.

## After Metrics

| Route | Status | TTFB | Total | Payload |
| --- | ---: | ---: | ---: | ---: |
| `/` | 200 | 0.156s | 0.157s | 159 KB |
| `/sale` | 200 | 0.016s | 0.017s | 130 KB |
| `/rent` | 200 | 0.011s | 0.012s | 132 KB |
| `/properties/1` | 200 | 0.012s | 0.468s | 37 KB |
| `/dashboard` | 307 | 0.037s | 0.037s | 24 B |
| `/admin/properties` | 307 | 0.002s | 0.002s | 33 B |
| `/login` | 200 | 0.007s | 0.008s | 32 KB |
| `/api/mobile/properties` | 200 | 0.306s | 0.306s | 8.5 KB |
| `/api/mobile/auth/login` | 200 | 0.379s | 0.379s | 450 B |

Largest static assets after:

- `chunks/0~gj12laizhyq.js`: 227 KB
- `chunks/0rc~8p7fsg8m5.js`: 156 KB
- `chunks/0q_pw.ygbf~ny.js`: 118 KB
- `chunks/03~yq9q893hmn.js`: 113 KB
- `chunks/0rolrqd7il1sd.css`: 77 KB

## Notes

- Public list TTFB improved substantially after cache warm-up.
- HTML payloads increased on public card pages because more card markup now renders on the server instead of hydrating as a client component. This trades a larger initial HTML response for less client-side JavaScript work and fewer hydrated card instances.
- `/properties/1` total time varied locally because it still performs detail/gallery work and view-related page rendering. The main detail query path was left functionally unchanged to avoid changing owner/admin visibility rules.
- Private dashboard/admin/message/profile data remains dynamic and uncached.
- Login is already within target locally: mobile API login measured under 1s warm with indexed email lookup and selected auth fields.

## Remaining Limitations

- Full browser waterfall metrics still need a real browser run in CI or a machine with Playwright/Lighthouse installed.
- The largest shared JS chunks are framework/app chunks; a deeper bundle analyzer pass would be needed to attribute exact dependency cost.
- The homepage still uses a remote CSS background hero image, which cannot receive the same `next/image` optimization controls as an image element.
- Public upload diagnostics have been removed from the final app surface; image performance should be checked through the real property upload flow.
