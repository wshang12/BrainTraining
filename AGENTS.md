# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**BrainTraining** is a Next.js 15 (App Router + Turbopack) cognitive training web app in Chinese. The main application lives in `brain-training/`. The root `package.json` only holds Prisma as a dependency.

### Running the app

- **Dev server**: `npm run dev` inside `brain-training/` (uses Turbopack, port 3000)
- **Lint**: `npm run lint` inside `brain-training/`
- **Build**: `npm run build` inside `brain-training/`
- See `brain-training/package.json` for all scripts.

### Key caveats

1. **Two `npm install` needed**: one at repo root (`/workspace`) for root-level Prisma, one inside `brain-training/`.
2. **Prisma client generation**: after install, run `npx prisma generate` inside `brain-training/` with `DATABASE_URL` set. The schema lives at `brain-training/prisma/schema.prisma`.
3. **`env.ts` Zod validation**: `brain-training/src/lib/env.ts` validates `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` at import time. Any server-side API route importing `env.ts` (via `kv.ts`) will crash if these are missing. Frontend pages are unaffected.
4. **Mock mode**: set `NEXT_PUBLIC_USE_MOCK=true` in `.env.local` to enable mock services (login, AI, payment, upload). This allows frontend-only development without real backend services.
5. **PostgreSQL required for API routes**: install locally (`sudo apt-get install -y postgresql postgresql-client`), start with `sudo pg_ctlcluster 16 main start`, create DB and user. The `.env.local` should have a valid `DATABASE_URL`.
6. **Upstash Redis**: API routes that use `kv.ts` make REST calls to Upstash. Without real Upstash credentials, these routes will fail at runtime (but won't block dev server startup). Placeholder URLs that pass Zod URL validation are sufficient to start the server.
7. **ESLint has pre-existing warnings/errors** — these are in the existing codebase and not regressions.
8. **No lockfile at root**: use `npm` (matching `package-lock.json`). Next.js warns about multiple lockfiles; this is cosmetic.
