# Estately Mobile

Expo React Native app for Estately. It supports native development and a static Expo Web export that can be deployed separately from the Next.js backend.

## Mobile Web Export

### API URL

Set `EXPO_PUBLIC_API_URL` to the deployed or local Next.js backend origin:

```env
EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app
```

The mobile API client appends `/api/mobile`, so use the backend origin unless you intentionally want to point directly at `/api/mobile`.

Local development notes:

- iOS simulator and Expo Web can usually use `http://localhost:3000`.
- Android emulator usually needs `http://10.0.2.2:3000`.
- A physical device must use your computer's local network URL, for example `http://192.168.1.20:3000`.
- Production must use the deployed Next.js backend URL: `https://estatelybg.netlify.app`.

### Run Locally

Start the backend first, then run the mobile app in web mode:

```bash
npm run --workspace=estately-web dev
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run --workspace=@estately/mobile web
```

You can also run Expo directly from this folder:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo start --web
```

### Export Static Web Build

Generate a deployable static web export:

```bash
EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app npm run export:web
```

Expo writes the static export to `apps/mobile/dist`.

### Deploy

For Netlify or another static host:

- Base directory: `apps/mobile`
- Build command: `EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app npm run export:web`
- Publish directory: `dist`
- Environment variable: `EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app`
- Production URL: `https://estately-mobile-bg.netlify.app`

If deploying with the Netlify CLI from `apps/mobile`, run:

```bash
EXPO_PUBLIC_API_URL=https://estatelybg.netlify.app npm run export:web
npx netlify deploy --dir=dist
```

Use `npx netlify deploy --prod --dir=dist` when promoting the export to production.
