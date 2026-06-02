# ADR-0002: Prisma ORM on Supabase Postgres

## Status

Accepted

## Context

The Dread Community Discord bot (`001-dread-community-bot`) needs durable, shared Postgres state across bot and worker processes: guild configuration, watcher dedupe keys, global package registrations, forum attempt history, and ephemeral announcement drafts.

Early planning assumed Supabase SQL migrations under `supabase/migrations/` and `@supabase/supabase-js` with a service-role key. The project adopted **Prisma ORM** while keeping **Supabase** as the database host.

## Decision

1. **Host**: Supabase-managed Postgres (dashboard, backups, optional future RLS).
2. **ORM and migrations**: Prisma 7 — `prisma/schema.prisma`, `prisma/migrations/`, `prisma migrate dev` / `migrate deploy`.
3. **Runtime access**: Shared `PrismaClient` with `@prisma/adapter-pg` in bot and worker (`src/lib/db/prisma.ts`).
4. **Connection strings**:
   - `DATABASE_URL` — Supabase transaction pooler + `?pgbouncer=true` for runtime.
   - `DIRECT_URL` — direct host for Prisma CLI and production `migrate deploy` (never migrate through the pooler).
5. **Out of scope v1**: `@supabase/supabase-js`, `supabase/migrations/`, Supabase Data API / anon client. Add only if Auth, Storage, Realtime, or REST access is required later.

Table and column definitions remain in [specs/001-dread-community-bot/data-model.md](../../specs/001-dread-community-bot/data-model.md).

## Consequences

**Positive**

- Type-safe queries and generated client; stores (`GuildConfigStore`, `WatcherDedupeStore`, etc.) map cleanly to Prisma models.
- One migration pipeline; no drift between Supabase CLI SQL and application schema.
- ESM project (`"type": "module"`) aligns with Prisma 7.

**Negative / tradeoffs**

- Operators must manage two connection URLs and understand pooler vs direct (PgBouncer breaks `prisma migrate` on pooled URLs).
- `pnpm strictDepBuilds` and `minimumReleaseAge` require explicit `allowBuilds` for Prisma engine install scripts.
- Supabase-specific features (RLS policies, Realtime) are not used until explicitly designed; server-side DB role from connection string is the v1 security boundary.

**Follow-up**

- Document setup in [docs/development.md](../development.md).
- Run `pnpm db:migrate:deploy` before bot/worker in Docker/CI.
