# Data Model: Core Platform (002)

**Feature**: `002-core-platform`  
**Canonical schema**: [001 data-model](../001-dread-community-bot/data-model.md) (full Postgres tables)  
**ORM**: Prisma 7 — [ADR-0002](../../docs/adr/0002-prisma-on-supabase-postgres.md)

Platform milestone **creates all epic tables** in the initial migration but **implements store access** only for entities below. Other tables are dormant until specs 003–010.

## Platform-implemented stores

### Guild configuration aggregate

| Prisma model(s) | Store interface | Platform scope |
|-----------------|-----------------|----------------|
| `GuildConfig` | `GuildConfigStore` | CRUD `guild_config`; read/write `guild_bot_admins` |
| `GuildThunderstoreConfig` | `GuildConfigStore` | Interface methods; impl may return null until 003 |
| `GuildGithubConfig` | `GuildConfigStore` | Same |
| `GuildForumConfig` | `GuildConfigStore` | Same (official guild only at call sites) |

**Validation** (enforced in store or zod DTOs):
- `guild_id` non-empty snowflake string.
- `dread_reply_channel_ids` array of channel snowflakes.
- Official-guild-only operations compare against `OFFICIAL_GUILD_ID`.

### Watcher dedupe

| Prisma model | Store interface | Platform scope |
|--------------|-----------------|----------------|
| `WatcherDedupe` | `WatcherDedupeStore` | `tryInsert(dedupeKey)` — `ON CONFLICT DO NOTHING` semantics |

**Keys** (documented for child specs): `ts:{namespace}-{name}@{version}`, `gh:{deliveryId}`.

### Global packages (stub)

| Prisma model | Interface | Platform scope |
|--------------|-----------|----------------|
| `GlobalPackage` | `GlobalPackageRegistry` | `listEffective()` = manifest JSON ∪ DB rows; write APIs stub/no-op |

### Job envelope (not persisted)

| Field | Type | Notes |
|-------|------|-------|
| `queue` | string | BullMQ queue name per [job-queues](../001-dread-community-bot/contracts/job-queues.md) |
| `name` | string | Job name within queue |
| `data` | JSON | Typed per queue |
| `jobId` | string optional | Idempotency when provided |

## Bundled config (repo files)

| File | Loaded by | Platform scope |
|------|-----------|----------------|
| `config/official-packages.json` | `GlobalPackageRegistry` | Parse + validate shape |
| `config/dread-persona.md` | `loadBundledConfig` | Expose path/content for 009 |
| Other `config/*.json` | `loadBundledConfig` | Exist as stubs; strict validation deferred |

## Entities created but not used in 002

Present in schema only: `ForumAttempt`, `AnnouncementDraft`, full watcher config rows populated by later specs.

## State transitions (platform)

None for 002 beyond dedupe insert (terminal) and guild config upsert (no workflow).

## Indexes and constraints

Mirror [001 data-model](../001-dread-community-bot/data-model.md) — unique `(namespace, name)` on `global_packages`, PK on `watcher_dedupe.dedupe_key`, composite PK on `guild_bot_admins`.
