# Tasks: Core Platform

**Input**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/) · [research.md](./research.md) · [quickstart.md](./quickstart.md)

**Branch**: `002-core-platform`

**Organization**: Tasks grouped by user story (US1 operator stack, US2 shared services). Setup and Foundational phases block all stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no incomplete-task dependencies)
- **[Story]**: US1 or US2 only in user-story phases

**Tests**: Included per SC-002 (permissions, container snapshots, queue mock).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, layout, config stubs, env contract

- [x] T001 Add runtime dependencies and scripts in `package.json`: discord.js, bullmq, ioredis, prisma, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `zod`; scripts `db:generate`, `db:migrate:dev`, `db:migrate:deploy`; `build` runs `prisma generate && tsc`
- [x] T002 Add Prisma engine packages to `pnpm-workspace.yaml` `allowBuilds` (`@prisma/engines`, `prisma`, etc.) after security review
- [x] T003 [P] Create directory layout per `plan.md`: `src/bot/`, `src/worker/`, `src/lib/db/`, `src/lib/config/`, `src/lib/dedupe/`, `src/lib/permissions/`, `src/lib/messages/`, `src/lib/queue/`, `src/lib/llm/`, `src/lib/packages/`, `prisma/`, `config/`
- [x] T004 [P] Add config stubs: `config/official-packages.json`, `config/faq.json`, `config/repo-tag-map.json`, `config/features.json`, `config/readme.json`, `config/downloads.json`, `config/dread-persona.md`
- [x] T005 Implement env validation in `src/lib/env.ts` per [contracts/env-validation.md](./contracts/env-validation.md)
- [x] T006 Update `.env.example` with keys required by `src/lib/env.ts` (`DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, optional LLM vars)
- [x] T007 [P] Add platform constants in `src/lib/constants.ts` (`OFFICIAL_GUILD_ID`, `GITHUB_REPO`) per FR-008

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, shared clients, stores, queue registry — **blocks US1 and US2**

**⚠️ CRITICAL**: No user story work until this phase is complete

- [x] T008 Add `prisma/schema.prisma` from [001 data-model](../001-dread-community-bot/data-model.md), `prisma.config.ts` (datasource `DIRECT_URL`), run `pnpm db:migrate:dev --name init`
- [x] T009 Implement Prisma client factory in `src/lib/db/prisma.ts` (`@prisma/adapter-pg`, `$disconnect` on shutdown)
- [x] T010 Implement `GuildConfigStore` in `src/lib/config/guild-config-store.ts` per [data-model.md](./data-model.md)
- [x] T011 Implement `WatcherDedupeStore` in `src/lib/dedupe/watcher-dedupe-store.ts` (`tryInsert` / conflict skip)
- [x] T012 Implement bundled config loader in `src/lib/config/load-bundled.ts` for `config/*.json` and `dread-persona.md`
- [x] T013 Implement queue name types and payload aliases in `src/lib/queue/queue-types.ts` from [001 job-queues](../001-dread-community-bot/contracts/job-queues.md)
- [x] T014 Implement `JobQueue` wrapper in `src/lib/queue/job-queue.ts` (enqueue API, Redis connection from env)
- [x] T015 Implement worker queue registry in `src/worker/register-processors.ts` — stub processor per epic queue name (log-only)
- [x] T016 Implement Discord client factory in `src/bot/client.ts` (intents: Guilds, GuildMessages, MessageContent)
- [x] T017 Implement `InteractionRouter` skeleton in `src/bot/interaction-router.ts` (register + dispatch map)

**Checkpoint**: Schema migrated; stores and queue wrapper callable from tests

---

## Phase 3: User Story 1 — Operator runs the platform stack (Priority: P1) 🎯 MVP

**Goal**: Bot and worker start with Redis and Postgres; migrations applied; clean shutdown; fail-fast on bad env/DB/Redis

**Independent Test**: QS-P1 in [quickstart.md](./quickstart.md) — `docker compose up` or dual `pnpm start` with healthy logs and tables in Supabase

### Tests for User Story 1

- [x] T018 [P] [US1] Unit test env fail-fast when `DISCORD_TOKEN` missing in `src/lib/env.test.ts`
- [x] T019 [P] [US1] Unit test `WatcherDedupeStore.tryInsert` duplicate returns false in `src/lib/dedupe/watcher-dedupe-store.test.ts`

### Implementation for User Story 1

- [x] T020 [US1] Refactor `src/index.ts` to bootstrap bot: `loadEnv()`, connect Prisma, login Discord client from `src/bot/client.ts`, log gateway ready
- [x] T021 [US1] Refactor `src/worker.ts` to bootstrap worker: `loadEnv()`, fail fast if Redis unreachable, call `src/worker/register-processors.ts`, log consumer registration
- [x] T022 [US1] Add graceful shutdown handlers in `src/bot/shutdown.ts` and `src/worker/shutdown.ts` (SIGTERM → disconnect Prisma, close BullMQ workers)
- [x] T023 [US1] Wire `interactionCreate` in `src/bot/handlers/interaction-create.ts` to `InteractionRouter` (smoke handler added in US2)
- [x] T024 [US1] Document or add Compose migrate step: `pnpm db:migrate:deploy` before bot/worker in `docker-compose.yml` or `Dockerfile` entrypoint script
- [x] T025 [US1] Ensure worker exits non-zero when `REDIS_URL` unreachable at startup (no silent retry loop) in `src/worker.ts`

**Checkpoint**: Operator can migrate + start bot + worker + Redis; US1 acceptance scenarios 1–4 satisfied

---

## Phase 4: User Story 2 — Feature modules plug into shared services (Priority: P1)

**Goal**: Permission resolver, Container builder, job enqueue from interaction, smoke command + job, registry and LLM skeletons

**Independent Test**: QS-P3–P5 in [quickstart.md](./quickstart.md); SC-002 Tier 0 tests green without live Discord

### Tests for User Story 2

- [x] T026 [P] [US2] PermissionResolver matrix tests in `src/lib/permissions/permission-resolver.test.ts` per [contracts/permission-resolver.md](./contracts/permission-resolver.md)
- [x] T027 [P] [US2] ContainerMessageBuilder snapshot tests in `src/lib/messages/container-message-builder.test.ts` with fixtures in `src/lib/messages/__fixtures__/`
- [x] T028 [P] [US2] JobQueue enqueue mock test in `src/lib/queue/job-queue.test.ts`
- [x] T029 [P] [US2] Smoke handler integration test (no live Discord) in `src/bot/handlers/platform-smoke.test.ts` per [contracts/smoke.md](./contracts/smoke.md)

### Implementation for User Story 2

- [x] T030 [US2] Implement `PermissionResolver` in `src/lib/permissions/permission-resolver.ts` per [contracts/permission-resolver.md](./contracts/permission-resolver.md)
- [x] T031 [US2] Implement `ContainerMessageBuilder` in `src/lib/messages/container-message-builder.ts` per [001 container-message](../001-dread-community-bot/contracts/container-message.md)
- [x] T032 [US2] Implement `GlobalPackageRegistry` skeleton in `src/lib/packages/global-package-registry.ts` (manifest ∪ DB; register throws until spec 004)
- [x] T033 [US2] Implement `LlmGateway` skeleton in `src/lib/llm/llm-gateway.ts` (`budgetOk`, no-op `complete` without `LLM_API_KEY`)
- [x] T034 [US2] Implement `/platform-smoke` handler in `src/bot/handlers/platform-smoke.ts` (defer, Container reply, enqueue smoke job)
- [x] T035 [US2] Register smoke command in `src/bot/register-commands.ts` (deploy script or dev guild registration)
- [x] T036 [US2] Add smoke job processor stub in `src/worker/processors/platform-smoke.ts` and register in `src/worker/register-processors.ts`
- [x] T037 [US2] Register smoke route on `InteractionRouter` in `src/bot/handlers/interaction-create.ts`
- [x] T038 [US2] Export platform module barrel or documented imports in `src/lib/index.ts` (optional thin re-exports for child specs)

**Checkpoint**: `/platform-smoke` works in dev; unit tests pass; child spec **003** can add commands on same router

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Docs, Tier 0, quickstart alignment

- [x] T039 [P] Align `docs/development.md` database and Docker sections with 002 env and migrate flow
- [x] T040 Run [quickstart.md](./quickstart.md) QS-P1–P5 manually or document Tier-1 gaps in spec checklist
- [x] T041 Verify Tier 0: `pnpm install && pnpm run build && pnpm run lint && pnpm test` from repo root
- [x] T042 [P] Mark completed items in `specs/002-core-platform/checklists/requirements.md` if checklist exists

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends on | Blocks |
|-------|------------|--------|
| 1 Setup | — | Phase 2 |
| 2 Foundational | Phase 1 | Phase 3, 4 |
| 3 US1 | Phase 2 | Phase 5 (partial) |
| 4 US2 | Phase 2; benefits from US1 bot/worker wiring (T020–T023) | Phase 5 |
| 5 Polish | US1 + US2 | — |

### User Story Dependencies

- **US1**: After Foundational — no dependency on US2
- **US2**: After Foundational — smoke command needs T020–T023 (bot/worker/router); core modules (T030–T033) can start after Phase 2 in parallel with late US1 tasks

### Within US2

- T030–T031 before T034 (smoke uses resolver + builder)
- T014–T015 before T036 (enqueue + processor)
- Tests T026–T029 can be written first (red) then implementation T030–T037

### Parallel Opportunities

**Phase 1**: T003, T004, T007 in parallel after T001–T002

**Phase 2**: T010–T012 in parallel after T008–T009; T013–T014 parallel; T016–T017 parallel after T014

**US1 tests**: T018, T019 parallel

**US2 tests**: T026–T029 parallel

**US2 impl**: T030, T031, T032, T033 parallel; then T034–T037 sequential on bot files

---

## Parallel Example: User Story 2

```bash
# Tests first (red-green):
pnpm test -- permission-resolver
pnpm test -- container-message-builder
pnpm test -- job-queue

# Core modules in parallel (different files):
# src/lib/permissions/permission-resolver.ts
# src/lib/messages/container-message-builder.ts
# src/lib/packages/global-package-registry.ts
# src/lib/llm/llm-gateway.ts
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 + Phase 2
2. Complete Phase 3 (US1) — operator can run stack
3. **Validate** QS-P1 before US2 polish

### Full platform (US1 + US2)

1. Setup + Foundational
2. US1 — dual process + migrate + shutdown
3. US2 — shared libraries + smoke + Tier 0 tests
4. Phase 5 — docs + CI verify

### Incremental delivery

| Increment | Delivers |
|-----------|----------|
| After Phase 2 | DB + stores + queue wrapper testable |
| After US1 | Runnable bot/worker/Redis/Postgres (MVP for ops) |
| After US2 | Spec **003** can land guild setup commands |

---

## Notes

- Canonical table definitions: [001 data-model](../001-dread-community-bot/data-model.md); 002 implements store subset in [data-model.md](./data-model.md)
- Do not implement watcher, forum, moderation, or feature slash commands (specs 003–010)
- Vitest tests live beside source: `src/**/*.test.ts`
- Commit in coherent chunks per phase checkpoint
