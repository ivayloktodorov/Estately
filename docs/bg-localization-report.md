# Bulgarian Localization Report

## Summary

Completed a Bulgarian localization cleanup pass for the main Estately web UI. The shared locale dictionaries now cover navigation, property search, property details, offers, dashboard, admin navigation, admin tables/actions, notifications, saved searches, and common empty states/buttons.

## Fixed Translations

- Header and footer navigation: Sale, Rent, About, Contact, Login, Register, Logout, Favorites, SoftUni Exam.
- Property browsing: Homes for sale, Rentals, Search, City, Type, Min, Max, Beds, Baths, Newest first, Clear, No properties found.
- Property details: Price, Property Summary, Bedrooms, Bathrooms, Area, Property Type, Address, Back to results, Similar properties, supporting similar-property copy.
- Offer UI: Make an offer, Offer amount (€), Message, Submit offer, loading state, Offers received, Offers submitted.
- Dashboard: My Properties, Add Property, Messages, Notifications, Saved Searches, Profile, Inquiries, Offers, Activity.
- Admin area: Admin Dashboard, Listing Moderation, User Management, Messages, table headers, primary filters, moderation actions, empty states, status labels.
- Notifications: common system notification titles such as Property approved, Property rejected, Property deleted, Property updated, Offer sent, Message received, Profile updated.
- Saved searches and favorites: saved-search actions, sign-in prompt, favorite empty state copy.

## Missing Keys Added

Added common keys for admin/dashboard sections, moderation actions, table labels, pagination labels, search placeholders, system notification titles, empty states, and supporting copy in:

- `estately-web/locales/en/common.json`
- `estately-web/locales/bg/common.json`

## Remaining Untranslated Content

- Property titles, descriptions, addresses, city values, messages, inquiry text, offer messages, user names, and uploaded content remain untranslated by design because they are database/user-entered content.
- Documentation and reviewer pages under `estately-web/app/docs/*` and most long-form SoftUni exam guidance remain primarily English because they are project/reviewer documentation rather than core product UI.
- Some server-side validation and API error strings remain English. These are not shown as persistent navigation/content labels and should be handled in a later validation-message localization pass if full runtime error localization is required.

## Verification

- Confirmed the app builds successfully after the localization cleanup.
- Recommended manual QA: switch EN to BG and back, then browse Sale, Rent, property details, dashboard, admin moderation, notifications, offers, messages, and saved searches.
