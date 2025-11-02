# Charmed Dating App – Frontend

This is the Next.js frontend for the Charmed/Alignd dating app.

## Getting Started

Run the development server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

The main landing page is at `src/app/page.tsx`. Auth screens live under `src/app/auth`, and the profile setup flow is under `src/app/setup`.

### Environment variables

Create a `.env.local` file with at least:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Adjust the URL to point to your backend.

## Disclaimer (Auth for development/testing)

- This app currently uses JWT-only authentication for local development and team testing.
- Email/phone verification and advanced auth hardening are not enforced yet in this branch.
- This makes it easy for you and other developers to create multiple test profiles and switch accounts quickly.
- Do not consider this auth flow production-ready. Before production, add verification, rate limiting, stricter session management, and security reviews.

## Scripts

- `npm run dev` – start the Next.js dev server
- `npm run build` – build for production
- `npm start` – run the production build

## Tech

- Next.js App Router, React, TypeScript
- Tailwind and shadcn/ui components
- Redux Toolkit for auth state

