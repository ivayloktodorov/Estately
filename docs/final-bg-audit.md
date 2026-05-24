# Final Bulgarian Localization Audit

Date: 2026-05-24

## Scope

- Audited `apps/mobile`, `estately-web/app`, and `estately-web/components` for visible English UI strings, placeholders, labels, empty states, form messages, navigation copy, property cards, details screens, profile/favorites/search flows, and admin/dashboard surfaces.
- Expanded the shared dictionaries in `estately-web/locales/en/common.json` and `estately-web/locales/bg/common.json`.
- Added mobile access to the same dictionary values through `apps/mobile/lib/i18n.ts`.

## Fixed In This Pass

- Mobile auth screens: login/register headings, subtitles, labels, placeholders, validation messages, submit states, and navigation links.
- Mobile home/search/favorites screens: loading, error, empty, pagination, filters, sorting, buttons, and helper copy.
- Mobile property cards/details: favorite accessibility labels, image empty states, badges, summary labels, description title, and contact-agent form messages.
- Mobile profile screen: headings, account labels, status copy, quick actions, retry states, and logout copy.
- Added missing shared keys for property labels, system messages, profile/favorites/search states, form placeholders, and mobile UI states.

## Verification

- `npm run --workspace=apps/mobile lint` passed.
- `npx tsc --noEmit -p apps/mobile/tsconfig.json` passed.
- `npm run --workspace=estately-web lint` passed with one pre-existing warning in `estately-web/app/test-r2/page.tsx` about `<img>`.
- `npx tsc --noEmit -p estately-web/tsconfig.json` passed.
- Dictionary parity check passed: English and Bulgarian both contain 221 keys with no missing counterparts.

## Remaining Audit Notes

The mobile application no longer has untranslated visible UI copy in the audited app files, except brand/code values such as `Estately` and email examples.

The web application still contains hardcoded English strings in legacy/public/admin/documentation pages and several forms. They were identified by grep, but not fully migrated in this pass because many affected files already had unrelated working-tree changes before this task began. High-priority remaining areas include:

- `estately-web/app/page.tsx`
- `estately-web/app/about/page.tsx`
- `estately-web/app/contact/page.tsx`
- `estately-web/app/dashboard/**`
- `estately-web/app/admin/**`
- `estately-web/components/property-form.tsx`
- `estately-web/components/edit-property-form.tsx`
- `estately-web/components/properties/**`
- `estately-web/app/(auth)/**`

## No Deploy

No deployment was run.
