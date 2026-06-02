# Tasks: Dread Community Discord Bot (monolith — superseded)

> **Split 2026-06-02**: Use per-feature `tasks.md` under [SPEC-INDEX](../SPEC-INDEX.md) (`002`–`010`). This file remains a historical rollup; new work tracks child specs.

**Input**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/)

**Branch**: `001-dread-community-bot`

**Organization**: Tasks grouped by user story for independent delivery. Setup partially complete (pnpm, Docker stub, strict TS/ESLint) — extend, do not duplicate.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Production dependencies and project layout per plan.md

**Status**: Toolchain and Docker skeleton exist — complete remaining setup.

- [ ] T001 Add runtime dependencies in package.json: discord.js, bullmq, ioredis, prisma, @prisma/client, @prisma/adapter-pg, pg, zod; add `db:generate`, `db:migrate:dev`, `db:migrate:deploy` scripts; wire `build` → `prisma generate && tsc`; add Prisma packages to `pnpm-workspace.yaml` `allowBuilds` after review
- [ ] T002 [P] Create directory layout per plan.md: src/bot, src/worker, src/lib (incl. `src/lib/db`), config, prisma/, tests/unit
- [ ] T003 [P] Add config JSON stubs: config/official-packages.json, faq.json, repo-tag-map.json, features.json, readme.json, downloads.json, dread-persona.md
- [ ] T004 [P] Add env validation module in src/lib/env.ts (zod schema for DISCORD_TOKEN, REDIS_URL, DATABASE_URL, DIRECT_URL, etc.)
- [ ] T005 Update .env.example with all required keys from src/lib/env.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure — MUST complete before user story phases

**⚠️ CRITICAL**: No user story work until this phase is complete

- [ ] T006 Add `prisma/schema.prisma` from data-model.md, `prisma.config.ts` (datasource `DIRECT_URL`), and initial migration via `pnpm db:migrate:dev --name init`
- [ ] T007 Implement Prisma client factory in src/lib/db/prisma.ts (`PrismaClient` + `@prisma/adapter-pg`; `$disconnect` on shutdown)
- [ ] T008 Implement GuildConfigStore in src/lib/config/guild-config-store.ts
- [ ] T009 Implement WatcherDedupeStore in src/lib/dedupe/watcher-dedupe-store.ts
- [ ] T010 Implement PermissionResolver in src/lib/permissions/permission-resolver.ts per contracts/slash-commands.md
- [ ] T011 [P] Unit tests for PermissionResolver in tests/unit/permission-resolver.test.ts
- [ ] T012 Implement ContainerMessageBuilder in src/lib/messages/container-message-builder.ts per contracts/container-message.md
- [ ] T013 [P] Snapshot tests for ContainerMessageBuilder in tests/unit/container-message-builder.test.ts
- [ ] T014 Implement JobQueue wrapper in src/lib/queue/job-queue.ts per contracts/job-queues.md
- [ ] T015 Implement Discord bot client factory in src/bot/client.ts (intents, partials)
- [ ] T016 Wire src/bot/index.ts: login, interactionCreate, messageCreate routers
- [ ] T017 Wire src/worker/index.ts: Redis connection, register all processors, health log
- [ ] T018 Implement worker HTTP server for GitHub webhook in src/worker/http.ts
- [ ] T019 Implement slash command registrar in src/bot/register-commands.ts (deploy to dev guild first)
- [ ] T020 Implement GlobalPackageRegistry in src/lib/packages/global-package-registry.ts
- [ ] T021 Implement LlmGateway skeleton in src/lib/llm/llm-gateway.ts (budget gate + no-op adapter for tests)

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Server staff configure watchers (Priority: P1) 🎯 MVP

**Goal**: Per-guild Thunderstore and GitHub channel/event registration with permission gates

**Independent Test**: QS1 in quickstart.md

### Implementation for User Story 1

- [ ] T022 [P] [US1] Implement /thunderstore setup in src/lib/commands/thunderstore-setup.ts
- [ ] T023 [P] [US1] Implement /github setup in src/lib/commands/github-setup.ts
- [ ] T024 [US1] Register US1 commands in src/bot/register-commands.ts
- [ ] T025 [US1] Route US1 commands in src/bot/handlers/interaction-create.ts with PermissionResolver
- [ ] T026 [P] [US1] Unit tests for guild config store thunderstore/github upsert in tests/unit/guild-config-store.test.ts

**Checkpoint**: US1 independently testable

---

## Phase 4: User Story 2 — Thunderstore updates (Priority: P1)

**Goal**: Announce core/plugin versions to configured guilds with Container messages and dedupe

**Independent Test**: QS2 in quickstart.md

### Implementation for User Story 2

- [ ] T027 [P] [US2] Implement Thunderstore API client in src/lib/watchers/thunderstore-client.ts
- [ ] T028 [US2] Implement ThunderstoreWatcher poll + enqueue in src/lib/watchers/thunderstore-watcher.ts
- [ ] T029 [US2] Implement announce processor for Thunderstore in src/worker/processors/announce-job.ts
- [ ] T030 [US2] Schedule thunderstore poll cron in src/worker/index.ts
- [ ] T031 [P] [US2] Integrate LLM summarize path in announce processor when body over limit
- [ ] T032 [P] [US2] Fixture test for dedupe key in tests/unit/watcher-dedupe.test.ts

**Checkpoint**: US2 independently testable (with manual/stub enqueue)

---

## Phase 5: User Story 3 — GitHub updates (Priority: P1)

**Goal**: Webhook-driven GitHub announcements per guild event toggles

**Independent Test**: QS3 in quickstart.md

### Implementation for User Story 3

- [ ] T033 [P] [US3] Implement GitHub signature verification in src/lib/watchers/github-webhook.ts
- [ ] T034 [US3] Map webhook payloads to internal events per contracts/github-webhook.md
- [ ] T035 [US3] Wire POST /webhooks/github in src/worker/http.ts
- [ ] T036 [US3] Extend announce processor for GitHub events (no role ping, conditional Thunderstore button)
- [ ] T037 [P] [US3] Fixture tests for push and release payloads in tests/unit/github-webhook.test.ts

**Checkpoint**: US1+US2+US3 deliver full watcher value

---

## Phase 6: User Story 4 — Staff announcements (Priority: P2)

**Goal**: Ephemeral LLM-reviewed announcement drafts with confirm/post-anyway

**Independent Test**: QS4 in quickstart.md

### Implementation for User Story 4

- [ ] T038 [P] [US4] Implement AnnouncementSession store in src/lib/announcements/announcement-session.ts
- [ ] T039 [US4] Implement /announce command flow in src/lib/commands/announce.ts
- [ ] T040 [US4] Implement announcement review job processor in src/worker/processors/announcement-review.ts
- [ ] T041 [US4] Handle announce component buttons in src/bot/handlers/interaction-create.ts
- [ ] T042 [P] [US4] Unit tests for session state machine in tests/unit/announcement-session.test.ts

**Checkpoint**: US4 independently testable

---

## Phase 7: User Story 5 — Support forum (Priority: P2)

**Goal**: FAQ, duplicate staff review, conditional codebase reply in official guild

**Independent Test**: QS5 in quickstart.md

### Implementation for User Story 5

- [ ] T043 [P] [US5] Implement /forum register in src/lib/commands/forum-register.ts
- [ ] T044 [P] [US5] Implement RepoRouter in src/lib/forum/repo-router.ts
- [ ] T045 [US5] Implement ForumPipeline orchestrator in src/lib/forum/forum-pipeline.ts
- [ ] T046 [US5] Implement forum post processor in src/worker/processors/forum-post.ts
- [ ] T047 [US5] Listen for forum thread create in src/bot/handlers (gateway event) and enqueue job
- [ ] T048 [US5] Handle forum:dup: buttons in interaction-create handler
- [ ] T049 [P] [US5] Implement ForumAttemptStore in src/lib/forum/forum-attempt-store.ts
- [ ] T050 [P] [US5] Implement /support repo fallback in src/lib/commands/support-repo.ts
- [ ] T051 [P] [US5] Implement RepoScanner in src/lib/forum/repo-scanner.ts

**Checkpoint**: US5 independently testable in official guild

---

## Phase 8: User Story 6 — Moderation (Priority: P2)

**Goal**: Guild-scoped moderation and bot-admin delegation

**Independent Test**: QS6 in quickstart.md

### Implementation for User Story 6

- [ ] T052 [P] [US6] Implement /config set-admin-role and grant-admin in src/lib/commands/config-admin.ts
- [ ] T053 [P] [US6] Implement moderation commands in src/lib/commands/moderation.ts (purge, ban, kick, timeout, role, userinfo)
- [ ] T054 [US6] Enforce moderate permission in all moderation handlers
- [ ] T055 [P] [US6] Unit tests for global admin denied abroad in tests/unit/permission-resolver.test.ts

**Checkpoint**: US6 independently testable

---

## Phase 9: User Story 7 — Global plugin register (Priority: P2)

**Goal**: Official-guild-only global Thunderstore package registration

**Independent Test**: Register package in official guild; appears in watcher list

### Implementation for User Story 7

- [ ] T056 [US7] Implement /plugin register in src/lib/commands/plugin-register.ts
- [ ] T057 [US7] Wire GlobalPackageRegistry insert + watcher refresh
- [ ] T058 [P] [US7] Unit test official-guild-only gate in tests/unit/plugin-register.test.ts

**Checkpoint**: US7 independently testable

---

## Phase 10: User Story 8 — Dread in-character replies (Priority: P3)

**Goal**: 1% probabilistic in-character replies in allowlisted channels

**Independent Test**: Allowlist channel, trigger keyword, verify reply reference

### Implementation for User Story 8

- [ ] T059 [P] [US8] Implement DreadReplyGate in src/lib/dread/dread-reply-gate.ts
- [ ] T060 [US8] Wire messageCreate handler in src/bot/handlers/message-create.ts
- [ ] T061 [US8] Implement dread reply processor in src/worker/processors/dread-reply.ts
- [ ] T062 [P] [US8] Load dread-persona.md in LlmGateway.dreadReply

**Checkpoint**: US8 independently testable

---

## Phase 11: User Story 9 — Utility commands (Priority: P3)

**Goal**: /features, /readme, /download from JSON bundles

**Independent Test**: QS7 in quickstart.md

### Implementation for User Story 9

- [ ] T063 [P] [US9] Implement UtilityContent loader in src/lib/config/utility-content.ts
- [ ] T064 [P] [US9] Implement utility slash commands in src/lib/commands/utility.ts
- [ ] T065 [US9] Register utility commands (no permission gate)
- [ ] T066 [P] [US9] Unit tests against JSON fixtures in tests/unit/utility-content.test.ts

**Checkpoint**: All user stories complete

---

## Phase 12: Polish & Cross-Cutting Concerns

- [ ] T067 [P] Add structured logging (pino) in src/lib/log.ts used by bot and worker
- [ ] T068 [P] Add CHANGELOG [Unreleased] entries for user-visible features
- [ ] T069 Update docs/development.md with Prisma migrate workflow, Supabase connection URLs, and GitHub webhook URL setup
- [ ] T070 Update CONTEXT.md glossary (Interaction, Container, Guild config)
- [ ] T071 Run quickstart.md Tier 0 validation and document Tier 1 gaps in docs/agents/verify-discord-bot.md
- [ ] T072 [P] Add docker compose healthchecks for bot/worker processes
- [ ] T073 Register global slash commands for production deploy script in package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → User stories (Phase 3–11) → **Phase 12**
- **US2, US3** depend on **US1** (need guild channel config)
- **US4–US9** depend on **Phase 2** only; can parallelize after US1–US3 if desired

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | Phase 2 |
| US2 | US1, Phase 2 |
| US3 | US1, Phase 2 |
| US4–US9 | Phase 2 (US7 also needs US2 watcher list) |

### Parallel Opportunities

- T002, T003, T004 in parallel
- T011, T013 after T010, T012 respectively
- US2 and US3 can proceed in parallel after US1
- US4–US6 can parallelize across developers after P1 watchers

---

## Implementation Strategy

### MVP (P1)

1. Complete Phase 1–2
2. US1 → US2 → US3
3. **STOP** and validate watchers in test guild

### Incremental

Add US4 → US7 (P2), then US8 → US9 (P3), then Phase 12.

---

## Notes

- Commit after each task group; message prefix `feat:` or `test:` per AGENTS.md
- Use `001-dread-community-bot` branch for feature PR to main
- Tier 0: `pnpm test` && `pnpm run lint` every commit
