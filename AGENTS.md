# Base44 Dev Environment

## Stack
- **Single-origin fullstack app**: Vite (client) + Express + tRPC (server) in one process.
- Dev command `pnpm dev` → `tsx watch server/_core/index.ts`. In `NODE_ENV=development` the server mounts Vite as middleware (`server/_core/vite.ts` → `setupVite`), so the client is served from the same origin on port 3000. No separate API port.
- Database: **MySQL 8** via Drizzle ORM (`drizzle-orm/mysql2`). Connection is **lazy** — `getDb()` returns null gracefully if `DATABASE_URL` is unset, so the app boots without a DB, but live-orders/admin features need it.
- Package manager: **pnpm** (corepack-activated `pnpm@10.4.1`). Lockfile is committed; install with `--frozen-lockfile`. A wouter patch (`patches/wouter@3.7.1.patch`) is applied automatically by pnpm.

## Running here
- `docker compose -f docker-compose.base44.yml up -d` brings up `mysql`, a one-shot `migrate` service (runs `drizzle-kit migrate`), and the `app` service.
- `app` and `migrate` bind-mount the repo at `/app` with a named volume `app_node_modules` so container-installed deps aren't shadowed by the host.
- Migrations live in `drizzle/*.sql`; schema in `drizzle/schema.ts`. The `migrate` service exits after applying them; `app` waits for it (`service_completed_successfully`).

## Environment / secrets
- Local-infra creds (`DATABASE_URL`, `MYSQL_*`, `JWT_SECRET`) are inline in compose / `.env.base44-defaults`.
- External **Manus platform** credentials (OAuth + Forge API for LLM/image/maps) are **optional for boot** — the public visitor flow (Home → Memberships → Register → … → Success) renders without them. They are needed only for admin login and AI/map features:
  - `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`
  - `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`
- Real secret values are delivered via `/run/base44/app.env` (listed as the LAST `env_file:` entry); placeholders in `.env.base44-defaults` are overridden by them.

## Hostname / preview
- Vite middleware is created with `allowedHosts: true` (in `server/_core/vite.ts`), so the preview's external hostname is accepted. The `allowedHosts` list in `vite.config.ts` does NOT apply in middleware mode.

## Verify it works
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the HTML with Vite's `/@react-refresh` injection (confirms live dev source, not a prebuilt bundle).
- `docker compose exec -T mysql mysql -ufazaa -pfazaa_pass -e "USE fazaa; SHOW TABLES;"` lists `users`, `live_orders`, `__drizzle_migrations`.

## Tests / checks
- `pnpm check` (tsc --noEmit), `pnpm test` (vitest run).
