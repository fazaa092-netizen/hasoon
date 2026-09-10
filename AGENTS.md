# AGENTS.md — Fazaa (Base44 dev environment)

## Stack
- **Frontend**: Vite 7 + React 19 + TailwindCSS 4, served from `client/`
- **Backend**: Express + tRPC, entry point `server/_core/index.ts`
- **Database**: MySQL 8 via Drizzle ORM (`drizzle-orm/mysql2`)
- **Package manager**: pnpm 10.4.1 (lockfile committed; wouter patch in `patches/`)

## How it runs
- `pnpm dev` = `NODE_ENV=development tsx watch server/_core/index.ts`
- The Express server starts on port 3000 and sets up Vite in middleware mode,
  serving both the tRPC API (`/api/trpc`) and the React frontend from a single origin.
- Vite config root is `client/`; aliases `@` → `client/src`, `@shared` → `shared/`.

## Database
- MySQL runs as a compose service (`db`). Migrations in `drizzle/` are applied
  by the one-shot `migrate` service before the web service starts.
- `DATABASE_URL` is set in compose `environment:` (local infra credential).
- The DB connection is lazy — `getDb()` returns null without `DATABASE_URL`,
  so the app boots but DB-backed features (orders, users) won't work without it.

## Environment variables
- `JWT_SECRET` — signs admin session tokens & user JWTs. Placeholder in
  `.env.base44-defaults`; override via platform secrets for production.
- `OAUTH_SERVER_URL`, `VITE_APP_ID` — Manus OAuth (optional; login won't work without them).
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` — Forge storage proxy (optional).
- `OWNER_OPEN_ID` — marks a user as admin on first sign-in (optional).

## Admin panel
- `/admin` — login with username `hasoon` (password is scrypt-hashed in `server/adminAuth.ts`).
- Requires `JWT_SECRET` to be set (placeholder works for dev).

## Verification
- `docker compose -f docker-compose.base44.yml up -d` then curl `http://localhost:3000/`
- The page should return the Arabic RTL homepage (فزعة | عام الأسرة 2026).
- tRPC endpoint at `/api/trpc` responds to JSON-RPC over POST.
