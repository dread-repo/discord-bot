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
| `pnpm test` | Vitest (`src/**/*.test.ts`) |
| `pnpm start` / `pnpm run start:bot` | Run bot entry |
| `pnpm run start:worker` | Run worker entry |
| `pnpm db:generate` | Generate Prisma Client (planned) |
| `pnpm db:migrate:dev` | Apply migrations in dev (`prisma migrate dev`) |
| `pnpm db:migrate:deploy` | Apply migrations in CI/production |

## Database (Supabase Postgres + Prisma)

Persistence for the active feature ([PRD](../specs/001-dread-community-bot/PRD.md)): **Supabase hosts Postgres**; **Prisma** owns schema and queries. See [ADR 0002](adr/0002-prisma-on-supabase-postgres.md).

### Prerequisites

- Supabase project (cloud dev project recommended for v1)
- Connection strings from **Project Settings → Database**

| Variable | Connection | Used by |
|----------|------------|---------|
| `DATABASE_URL` | Transaction pooler, port **6543**, append `?pgbouncer=true` | Bot, worker (`PrismaClient`) |
| `DIRECT_URL` | Direct host `db.<project-ref>.supabase.co:5432` | `prisma migrate`, `migrate deploy` |

Never run migrations against the pooled URL (PgBouncer causes prepared-statement errors).

### First-time schema setup

```bash
cp .env.example .env
# Set DATABASE_URL and DIRECT_URL in .env

pnpm install
pnpm db:migrate:dev --name init   # creates prisma/migrations from schema
pnpm db:generate
pnpm run build
```

Verify tables in the Supabase Table Editor match [data-model.md](../specs/001-dread-community-bot/data-model.md).

### Production / Docker

Before starting bot or worker, apply pending migrations:

```bash
pnpm db:migrate:deploy
```

Docker Compose runs `scripts/docker-entrypoint.sh` before bot/worker, which calls `pnpm db:migrate:deploy` when `DATABASE_URL` or `DIRECT_URL` is set.

### Tests

Use a separate test database (Supabase branch/project or local Postgres) or mock stores at module boundaries. Do not point tests at production `DATABASE_URL`.

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

| Variable | Used by | Status |
|----------|---------|--------|
| `DISCORD_TOKEN` | bot | Required |
| `DISCORD_CLIENT_ID` | bot | Required (application id) |
| `DISCORD_DEV_GUILD_ID` | bot | Optional — guild-scoped slash commands (instant); omit for global |
| `REDIS_URL` | bot, worker | Set by Docker Compose to `redis://redis:6379` |
| `DATABASE_URL` | bot, worker | Planned — Supabase pooler + `?pgbouncer=true` |
| `DIRECT_URL` | migrate, CI | Planned — direct Postgres for Prisma CLI |
| `GITHUB_WEBHOOK_SECRET` | worker | Planned |
| `LLM_API_KEY` | worker | Planned |

Never commit `.env`.

### Slash commands

On startup the bot calls the Discord REST API to register commands (`platform-smoke` today). You can also deploy without starting the gateway:

```bash
pnpm run build
pnpm run deploy-commands   # reads .env from repo root; Discord vars only
```

`deploy-commands` loads `.env` automatically and only requires `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` (not `DATABASE_URL` / `REDIS_URL`). Run it from the repo root so `.env` is found.

| Mode | Env | When commands appear |
|------|-----|----------------------|
| Guild (recommended for dev) | `DISCORD_DEV_GUILD_ID=<server id>` | Usually within seconds |
| Global | leave `DISCORD_DEV_GUILD_ID` unset | Up to ~1 hour |

Invite URL must include scope `applications.commands`. The bot must be in the guild when using `DISCORD_DEV_GUILD_ID`.

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
| `prisma/` | Schema and migrations (planned) |
| `prisma.config.ts` | Prisma 7 CLI config (planned) |

## Related docs

- [AGENTS.md](../AGENTS.md) — agent verify tiers and git policy
- [CONTRIBUTING.md](../CONTRIBUTING.md) — PR expectations
- [CONTEXT.md](../CONTEXT.md) — domain glossary
