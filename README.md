# Time-Blocking Calendar

A personal time-blocking calendar app with a Linear/Cron-style UI. Built with Next.js 14, Tailwind CSS, shadcn/ui, and Supabase.

## Running the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For production build and start:

```bash
npm run build
npm start
```

## Running Vitest tests locally

- **Watch mode:** `npm run test` — runs tests in watch mode.
- **Single run (CI):** `npm run test:ci` — runs tests once and exits.

Tests live in the `tests/` folder and use `tests/setup.ts` for global setup (e.g. React Testing Library cleanup).

## Environment variables

See [.env.example](.env.example) for required Supabase and Sentry keys. Copy to `.env.local` and fill in values for deployment and full functionality.

## Tech stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Supabase (Auth + PostgreSQL)
- **Testing:** Vitest + React Testing Library
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
