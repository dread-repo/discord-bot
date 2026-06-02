# Research: Core Platform (002)

**Feature**: `002-core-platform`  
**Date**: 2026-06-02  
**Epic reference**: [001 research](../001-dread-community-bot/research.md) — platform defers to epic decisions unless noted below.

## P1: Process layout (bot + worker + Redis)

**Decision**: Three Compose services — `bot` (`dist/index.js`), `worker` (`dist/worker.js`), `redis:7-alpine` — one Docker image, different commands. Bot owns gateway + interactions; worker owns BullMQ consumers and optional HTTP webhook listener (stub route until spec 005).

**Rationale**: FR-001/FR-006; epic PRD already committed `docker-compose.yml`. Separates Discord 3s interaction budget from long I/O (LLM, git, polls).

**Alternatives considered**:
- Single process with `setImmediate` jobs: rejected — event-loop contention under forum/LLM load.
- Serverless workers: rejected — VPS + Compose is the documented deploy target.

**Implementation notes**:
- Startup order: `redis` healthy → migrate (one-shot or entrypoint) → bot + worker.
- Bot starts without Redis only if enqueue is unused; document that smoke job tests require Redis.
- Graceful shutdown: disconnect Prisma + close BullMQ workers on `SIGTERM`.

## P2: Prisma schema scope for platform milestone

**Decision**: Ship **full epic schema** in `prisma/schema.prisma` on first platform migration (`init`), matching [001 data-model](../001-dread-community-bot/data-model.md). Platform code implements stores for `guild_config`, `watcher_dedupe`, and read stubs for `global_packages`; other tables exist but stay unused until child specs.

**Rationale**: One migration pipeline avoids additive churn across specs 003–010; ADR-0002 mandates Prisma as single source of truth.

**Alternatives considered**:
- Minimal tables for 002 only: rejected — would force follow-up migrations and drift risk.
- Supabase SQL migrations: rejected per ADR-0002.

**Connection model**: Unchanged from epic R3 — `DATABASE_URL` (pooler + `pgbouncer=true`), `DIRECT_URL` for CLI/deploy.

## P3: BullMQ queue registry

**Decision**: Central `createQueue(name)` / `registerProcessor(name, handler)` in `src/lib/queue/` with queue names and payload types copied from [job-queues contract](../001-dread-community-bot/contracts/job-queues.md). Platform ships **no-op or logging processors** for every queue; feature specs replace stubs.

**Rationale**: FR-005; worker must register consumers at boot so Redis connection and routing are proven before spec 004+.

**Alternatives considered**:
- Register queues lazily per spec: rejected — worker boot would not validate Redis wiring.

**Smoke queue**: `platform:smoke` (002-only) for integration tests — not in epic contract; removed or aliased to `llm:dread-reply` stub if we want zero extra queue names. **Chosen**: use `platform:smoke` in tests only; production registry lists epic queues + smoke behind `NODE_ENV=test` or explicit test helper.

## P4: Interaction router and smoke command

**Decision**: `InteractionRouter` maps `interaction.commandName` → handler module. Register `/platform-smoke` (guild-installable, ephemeral) returning a Container built by `ContainerMessageBuilder` and enqueueing a test job.

**Rationale**: Proves FR-004, FR-005, FR-006 without implementing feature commands from 003–010.

**Alternatives considered**:
- No slash command, test builders only: rejected — does not validate Discord registration path.

**discord.js**: v14.19+, `REST` + `Routes.applicationCommands` for deploy; deferReply + editReply for smoke job path.

## P5: Permission resolver

**Decision**: `PermissionResolver.can(actor, action, context)` with actions from spec FR-003. Rules:
- `config`, `moderate`: Discord permission **or** guild `guild_bot_admins` row **or** `Manage Guild` for config-only helpers.
- `globalPluginRegister`, `officialForumRegister`: actor in official guild `1510452344024727775` **and** (Discord Administrator **or** global admin list — v1: Administrator in official guild only unless `setBotAdmin` table used).
- `setBotAdmin`: Discord Administrator in target guild.
- Global admin (`guild_bot_admins` in official guild) **cannot** `moderate` in other guilds without local mod role or bot-admin row there.

**Rationale**: FR-003, epic FR-016; unit-tested matrix is the acceptance gate for 002.

**Alternatives considered**:
- Per-command ad hoc checks: rejected — child specs need one import.

## P6: Container message builder

**Decision**: Implement `buildAnnounceContainer(meta: AnnounceMeta)` per [container-message contract](../001-dread-community-bot/contracts/container-message.md) in `src/lib/messages/container-message-builder.ts`. Utility/ephemeral templates are thin wrappers calling the same builder with different labels.

**Rationale**: FR-004; snapshot tests lock layout before watchers land.

## P7: Store interfaces

**Decision**:
- `GuildConfigStore`: `get`, `upsert`, `delete` for `guild_config` + related child configs (methods for thunderstore/github/forum configs exposed but may throw `not implemented` until 003).
- `WatcherDedupeStore`: `tryInsert(key)` → boolean (insert-or-skip).
- `GlobalPackageRegistry`: interface + manifest merge stub (returns manifest-only until 004).

**Rationale**: FR-002 stores; interfaces let 003+ extend without breaking platform tests.

## P8: LLM gateway skeleton

**Decision**: `LlmGateway` with `budgetOk()`, `complete(prompt)` throwing or no-op when `LLM_API_KEY` unset; env `LLM_PROVIDER`, `LLM_MODEL`, `LLM_DAILY_TOKEN_BUDGET` validated optionally at startup.

**Rationale**: FR-009; child specs inject real adapter.

## P9: Config JSON stubs

**Decision**: Commit minimal valid JSON under `config/` for paths in FR-010 (`official-packages.json`, `faq.json`, `repo-tag-map.json`, `features.json`, `readme.json`, `downloads.json`) plus `dread-persona.md` placeholder. Loader in `src/lib/config/load-bundled.ts` with schema validation (zod) for arrays/objects only where needed for smoke.

**Rationale**: FR-010; downstream specs flesh out content.

## P10: Environment validation

**Decision**: `loadEnv()` using zod at process entry — **required**: `DISCORD_TOKEN`, `DATABASE_URL`, `REDIS_URL`; **required for worker HTTP stub**: none in 002; **optional**: `DIRECT_URL` (warn if missing when running migrate locally), LLM vars, `GITHUB_WEBHOOK_SECRET`. Fail fast with structured log line listing missing keys.

**Rationale**: FR-007; avoids silent partial boot.

## P11: Platform constants

**Decision**: `src/lib/constants.ts` exports `OFFICIAL_GUILD_ID = '1510452344024727775'`, `GITHUB_REPO = 'dread-repo/dreadREPO'`.

**Rationale**: FR-008; single import for child specs.

## P12: Testing (Tier 0)

**Decision**: Vitest — PermissionResolver table tests, ContainerMessageBuilder golden snapshots, queue enqueue with ioredis mock or `bullmq` test double, store tests with Prisma mock or test DB (prefer mocks for CI speed in 002).

**Rationale**: SC-002, SC-003; AGENTS.md Tier 0.

**Alternatives considered**:
- Live Discord in CI: rejected.
