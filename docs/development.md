# Development setup

Guide for local development and Docker deployment of **discord-bot**.

## Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| Node.js | 22+ | See `.node-version` |
| pnpm | 11.5+ | `corepack enable` (matches `packageManager` in `package.json`) |
| Docker | Current | For `docker compose` stack |

## Install and verify (local)

```bash
corepack enable
pnpm install
pnpm run build
pnpm run lint
pnpm test
```

### Scripts

| Script | Purpose |
|--------|---------|
| `pnpm run build` | Compile `src/` → `dist/` |
| `pnpm run typecheck` | Typecheck without emit |
| `pnpm run lint` | ESLint (strict + import-x) |
| `pnpm test` | Vitest (`tests/unit`, `src/**/*.test.ts`) |
| `pnpm run db:generate` | Regenerate Prisma Client after schema changes |
| `pnpm run db:migrate` | Apply migrations (`prisma migrate deploy`) |
| `pnpm run db:migrate:dev` | Create/apply migrations in development |
| `pnpm run db:studio` | Open Prisma Studio |
| `pnpm start` / `pnpm run start:bot` | Run bot entry |
| `pnpm run start:worker` | Run worker entry |

## Toolchain and security (pnpm)

Configuration lives in **`pnpm-workspace.yaml`** (pnpm 11 reads non-auth settings there, not `.npmrc`).

| Setting | Effect |
|---------|--------|
| `minimumReleaseAge: 10080` | Resolves package versions at least **7 days** old (minutes) |
| `minimumReleaseAgeStrict: true` | Fails install if age rules would be violated |
| `strictDepBuilds: true` | Every dependency with install scripts must appear in `allowBuilds` |
| `allowBuilds` | Only `true` entries may run lifecycle scripts; others are explicit denies |

To permit a package’s install script (e.g. a native addon), add `packagename: true` under `allowBuilds` after review. Do not use blanket allow-all flags in production.

`.npmrc` only sets `engine-strict=true` for registry/auth compatibility with pnpm 11.

## TypeScript and ESLint

- **TypeScript** (`tsconfig.json`): `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUncheckedSideEffectImports`, `noEmitOnError`, etc.
- **ESLint** (`eslint.config.js`): `typescript-eslint` strict type-checked presets, `eslint-plugin-import-x` (unresolved imports, cycles, duplicates), `no-console` in app code (off in `*.test.ts`).

Config files `eslint.config.js` and `vitest.config.ts` are excluded from typed linting.

## Environment variables

Copy the template and fill values as features land:

```bash
cp .env.example .env
```

| Variable | Used by | Secret? |
|----------|---------|---------|
| `DISCORD_TOKEN` | bot | Yes |
| `DISCORD_APPLICATION_ID` | bot | No |
| `DISCORD_DEV_GUILD_ID` | bot | No |
| `DATABASE_URL` | bot, worker (Prisma → Supabase Postgres) | Yes |
| `REDIS_URL` | bot, worker | Sometimes |
| `GITHUB_WEBHOOK_SECRET` | worker | Yes |
| `LLM_API_KEY` | worker | Yes |

Never commit `.env`. In Cursor Cloud, register secrets as **runtime** variables (same names as above).

### Database (Supabase + Prisma)

Postgres is hosted on **Supabase**; the app uses **Prisma ORM** with `DATABASE_URL` (not the Supabase JS client).

1. Supabase dashboard → **Project Settings** → **Database** → copy the **URI** (prefer the connection pooler on port `6543` for server apps).
2. Set `DATABASE_URL` in `.env` or Cursor Cloud secrets.
3. Apply schema:

```bash
pnpm run db:migrate
```

For local schema changes: `pnpm run db:migrate:dev`.

### GitHub webhooks, smee.io, and Cloudflare Tunnel

Full step-by-step setup (smee for local dev, `cloudflared` for HTTPS, env vars, Docker): **[README.md § Setup guide](../README.md#setup-guide)**.

### Troubleshooting `Cannot find module .../typescript/bin/tsc`

Usually a corrupted `node_modules` tree (interrupted install or sandbox `EPERM` during recreate):

```bash
rm -rf node_modules
pnpm install
pnpm run build
```

Ensure you are not using a project-local `.pnpm-store/` inside the repo; let pnpm use the global store.

## Docker

Production-shaped layout from the [PRD](../specs/001-dread-community-bot/PRD.md): three services from one image.

```bash
cp .env.example .env   # optional until secrets are required
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f worker
```

| Service | Command | Purpose |
|---------|---------|---------|
| `redis` | `redis-server` | Job queue backend, persistent volume `redis-data` |
| `bot` | `node dist/index.js` | Discord gateway (stub until implemented) |
| `worker` | `node dist/worker.js` | Background jobs (stub until BullMQ) |

- Image: multi-stage **`Dockerfile`** (pnpm install → `tsc` → non-root runtime).
- Build context: **`.dockerignore`** excludes `node_modules`, specs, agent tooling, secrets.
- Compose: **`docker-compose.yml`** — `.env` is optional (`required: false`).
- Redis host port: `127.0.0.1:6379` only (not exposed on all interfaces).

Rebuild after code changes:

```bash
docker compose build bot worker
docker compose up -d
```

## Repository layout (application)

| Path | Purpose |
|------|---------|
| `src/index.ts` | Bot process entry |
| `src/worker.ts` | Worker process entry |
| `dist/` | Build output (gitignored) |
| `specs/001-dread-community-bot/` | Active Spec Kit feature (spec, PRD, checklist) |

## Related docs

- [AGENTS.md](../AGENTS.md) — agent verify tiers and git policy
- [CONTRIBUTING.md](../CONTRIBUTING.md) — PR expectations
- [CONTEXT.md](../CONTEXT.md) — domain glossary
