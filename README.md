# Tedoku

A health app: cycle, water and sleep tracking, an anonymous "Ask Tedoku" assistant, and private chats with verified doctors, paid in naira or USDC.

This repository holds **two separate apps that share one backend contract**:

| Folder | What it is | Built with |
| --- | --- | --- |
| `apps/mobile` | The patient and doctor app (iOS, Android, web) | Expo + React Native + Expo Router |
| `apps/admin` | The admin dashboard (desktop web) | Vite + React + React Router |
| `packages/shared` | API client, endpoint list, data types, placeholder data, brand colours | TypeScript |

The two apps build and deploy on their own, but both import `@tedoku/shared`. That is what keeps them connected: they call the same endpoints and use the same data shapes, so a change an admin makes in the dashboard (approving a doctor, changing the platform fee, pausing USDC) is what the mobile app reads.

## Running it

You need Node.js 20 or newer. From the repository root:

```bash
npm install
```

Admin dashboard (opens at http://localhost:5173):

```bash
npm run admin
```

Mobile app (scan the QR code with Expo Go, or press `w` for web):

```bash
npm run mobile
```

Build the admin dashboard for hosting (output in `apps/admin/dist`; configure the host to serve `index.html` for every path):

```bash
npm run admin:build
```

## Placeholder data, and switching to real endpoints

Every screen currently runs on **placeholder data** copied from the design. Nothing is hard-coded in the screens themselves: they all call functions in `packages/shared/src/api/`, and each function returns placeholder data until it is pointed at the backend.

- `packages/shared/src/api/endpoints.ts` lists every endpoint path in one place. Update the paths here when the backend publishes its routes.
- `packages/shared/src/types.ts` describes the JSON each endpoint should return.
- `packages/shared/src/api/mocks/` holds the placeholder data. You can delete it once everything is live.

To switch an app to the real backend, set its API URL:

- Mobile: copy `apps/mobile/.env.example` to `apps/mobile/.env` and set `EXPO_PUBLIC_API_URL`.
- Admin: copy `apps/admin/.env.example` to `apps/admin/.env` and set `VITE_API_URL`.

When the URL is set, placeholder data is switched off and every call goes to `API_URL + path` with the user's token as a `Bearer` header. While the URL is empty you see "Sample data" labels in the dashboard and "Demo: …" hints in the app; both disappear on real data.

To move endpoints over one at a time instead, edit the `configureApi` call (`apps/mobile/src/lib/api.ts` and `apps/admin/src/main.tsx`): keep placeholders on and list the paths that are live:

```ts
configureApi({ baseUrl: 'https://api.example.com', useMocks: true, liveEndpoints: ['/doctors', '/doctors/:id'] });
```

### Still to wire up

Search the code for `PLACEHOLDER` to find each of these:

- Sign-in with Google, and storing the session token securely (`expo-secure-store`).
- Card payments through the payment gateway's SDK, and the real USSD bank list.
- Connecting an external wallet (WalletConnect) and a real QR code for the deposit address.
- Uploading ID, selfie and license photos (`expo-image-picker`).
- Live chat updates (the chat screens poll every 3 seconds for now).
- Native date and time pickers on sign-up and the sleep tracker.
- Screens the design does not cover yet: Care tab, Receipts, editing contact details, replacing documents, Contact support.

## Where each design board lives

| Design section | Code |
| --- | --- |
| Patient onboarding and home | `apps/mobile/src/app/index.tsx`, `welcome.tsx`, `onboarding/*`, `home.tsx`, `cycle.tsx`, `sleep-setup.tsx`, `sleep.tsx` |
| Sign in and forgot password | `login.tsx`, `doctor-login.tsx`, `forgot-password.tsx` |
| Doctors, chat and Ask Tedoku | `doctors.tsx`, `doctor/[id].tsx`, `chat/[id].tsx`, `learn.tsx` |
| Payment before chat, top up | `checkout/[doctorId].tsx`, `top-up.tsx` |
| Profiles | `me.tsx`, `privacy.tsx`, `provider/profile.tsx` |
| Doctor application | `provider-apply.tsx` |
| Doctor inbox, chat and earnings | `provider/index.tsx`, `provider/chats.tsx`, `provider/chat/[id].tsx`, `provider/earnings.tsx` |
| Admin dashboard | `apps/admin/src/pages/*` |
