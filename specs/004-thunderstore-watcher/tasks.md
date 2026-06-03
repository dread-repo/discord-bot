# Tasks: Thunderstore Watcher & Global Packages

**Input**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/) · [research.md](./research.md) · [quickstart.md](./quickstart.md)

**Branch**: `004-thunderstore-watcher`

**Depends on**: [002](../002-core-platform/tasks.md), [003](../003-guild-watcher-config/tasks.md) on `main`

---

## Phase 1: Setup

**Purpose**: Types, dedupe keys, env for poll interval

- [X] T001 [P] Add Thunderstore API zod schemas in `src/lib/watchers/thunderstore-types.ts`
- [X] T002 [P] Add dedupe key helper `ts:{namespace}/{name}@{version}` in `src/lib/watchers/thunderstore-dedupe.ts`
- [ ] T003 Add optional `THUNDERSTORE_POLL_INTERVAL_MS` to worker env schema in `src/lib/env.ts`

---

## Phase 2: Foundational (Blocking)

**Purpose**: Registry + guild list + processor wiring before user stories

- [ ] T004 Implement `GlobalPackageRegistry.register` in `src/lib/packages/global-package-registry.ts`
- [ ] T005 Add `listThunderstoreGuilds()` on `GuildConfigStore` in `src/lib/config/guild-config-store.ts`
- [ ] T006 [P] Unit tests for dedupe key + registry register in `src/lib/watchers/thunderstore-dedupe.test.ts` and `src/lib/packages/global-package-registry.test.ts`
- [ ] T007 Implement `ThunderstoreClient.fetchPackage` in `src/lib/watchers/thunderstore-client.ts` per [contracts/thunderstore-api.md](./contracts/thunderstore-api.md)
- [ ] T008 [P] Unit tests for client response parsing in `src/lib/watchers/thunderstore-client.test.ts`

**Checkpoint**: Client + stores ready; no Discord posts yet

---

## Phase 3: User Story 1 — Community receives Thunderstore updates (Priority: P1) 🎯 MVP

**Goal**: Poll → dedupe → announce Container messages with ping role

**Independent Test**: [quickstart.md](./quickstart.md) QS2

### Implementation for User Story 1

- [ ] T009 [US1] Implement poll logic `checkAllPackages` in `src/lib/watchers/thunderstore-watcher.ts`
- [ ] T010 [US1] Implement `thunderstore-poll` processor in `src/worker/processors/thunderstore-poll.ts`
- [ ] T011 [US1] Implement `thunderstore-announce` processor in `src/worker/processors/thunderstore-announce.ts` using `ContainerMessageBuilder` + `WatcherDedupeStore`
- [ ] T012 [US1] Wire real processors in `src/worker/register-processors.ts` for `watcher:thunderstore` (replace stub)
- [ ] T013 [US1] Add poll scheduler in `src/worker/schedule/thunderstore-poll.ts` and invoke from `src/worker.ts`
- [ ] T014 [US1] Enqueue `llm:changelog-summarize` when body exceeds `MAX_BODY_CHARS` in `src/worker/processors/thunderstore-announce.ts` (fallback truncation if LLM stub)

**Checkpoint**: QS2 — one announce per version; dedupe on replay

---

## Phase 4: User Story 2 — Global plugin registration (Priority: P2)

**Goal**: `/plugin register` in official guild only

**Independent Test**: [quickstart.md](./quickstart.md) US2 section

### Implementation for User Story 2

- [ ] T015 [P] [US2] Add slash definition in `src/bot/commands/plugin-register-commands.ts`
- [ ] T016 [US2] Implement `createPluginRegisterHandler` in `src/bot/handlers/plugin-register.ts` per [contracts/plugin-register.md](./contracts/plugin-register.md)
- [ ] T017 [US2] Register command in `src/bot/register-commands.ts` and handler in `src/bot/handlers/interaction-create.ts`

**Checkpoint**: Official guild register persists; denied elsewhere

---

## Phase 5: Polish & Cross-Cutting

- [ ] T018 [P] Document `THUNDERSTORE_POLL_INTERVAL_MS` in `docs/development.md`
- [ ] T019 Verify Tier 0: `pnpm test && pnpm run lint && pnpm run build`
- [ ] T020 [P] Update [CHANGELOG.md](../../CHANGELOG.md) `[Unreleased]` for Thunderstore watcher + `/plugin register`

---

## Dependencies & Execution Order

| Phase | Blocks |
|-------|--------|
| 1 Setup | 2 |
| 2 Foundational | 3, 4 |
| 3 US1 (MVP) | 5 |
| 4 US2 | 5 |

### Parallel opportunities

- T001–T002, T006–T008, T015 parallel where marked
- US2 (phase 4) can start after T004 (registry) even if US1 incomplete

---

## Implementation Strategy

**MVP**: Phases 1–3 (US1) — community announcements without global register command.

**Commits**: One git commit per task via `commit-task.sh T###` on branch `004-thunderstore-watcher`.

---

## Notes

- Do not implement GitHub webhook watcher (005).
- Use `toBullMqQueueName()` for all BullMQ queue registration/enqueue.
