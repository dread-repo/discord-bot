# Quickstart: Core Platform (002)

Operator and maintainer acceptance for the shared runtime **before** feature specs 003–010.

## Prerequisites

- Node.js 22+, pnpm 11.5+
- Supabase project with `DATABASE_URL` (pooler) and `DIRECT_URL` (direct)
- Discord application + bot token, `DISCORD_CLIENT_ID`
- Docker (optional, recommended for Redis)

## First-time setup

```bash
cp .env.example .env
# Set DISCORD_TOKEN, DISCORD_CLIENT_ID, DATABASE_URL, DIRECT_URL, REDIS_URL

corepack enable
pnpm install
pnpm db:migrate:dev --name init   # after schema lands
pnpm db:generate
pnpm run build
pnpm run lint
pnpm test
```

## QS-P1: Stack health (US1)

1. Start Redis: `docker compose up redis -d` or local Redis on `REDIS_URL`.
2. Apply migrations: `pnpm db:migrate:deploy`.
3. Start bot and worker:
   - `docker compose up bot worker` **or**
   - `pnpm run start:bot` and `pnpm run start:worker` in two terminals.
4. Confirm logs: bot gateway ready; worker Redis connected; processors registered (stub log lines OK).
5. Stop one process — no hung handles (Prisma disconnect in logs).

**Pass**: Both processes start; migration tables visible in Supabase Table Editor per [data-model.md](./data-model.md).

## QS-P2: Env fail-fast (FR-007)

1. Unset `DISCORD_TOKEN`, start bot.
2. Process exits non-zero with clear missing-var message.

**Pass**: No silent hang.

## QS-P3: Platform smoke (US2)

1. Invite bot to test guild with Administrator.
2. Deploy commands (script TBD in tasks).
3. Run `/platform-smoke`.
4. Receive ephemeral Container reply within 3s.
5. Worker log shows smoke job processed.

**Pass**: Interaction + job path works.

## QS-P4: Permission matrix (unit, no Discord)

```bash
pnpm test -- permission-resolver
```

**Pass**: Global admin abroad cannot moderate test case green.

## QS-P5: Container snapshots

```bash
pnpm test -- container-message
```

**Pass**: Golden files match [001 container contract](../001-dread-community-bot/contracts/container-message.md).

## Tier 0 (CI)

```bash
pnpm install
pnpm db:generate
pnpm run build
pnpm run lint
pnpm test
```

No live Discord required for merge if QS-P3 is manual Tier 1.

## Out of scope for 002 quickstart

- `/thunderstore`, `/github`, `/announce`, forum, moderation feature commands — see specs 003–010 quickstarts when those ship.
