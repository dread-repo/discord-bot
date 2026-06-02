# Tasks: Guild Watcher Configuration

**Input**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/) · [research.md](./research.md) · [quickstart.md](./quickstart.md)

**Branch**: `003-guild-watcher-config`

**Depends on**: [002-core-platform](../002-core-platform/tasks.md) complete (platform on `main`)

**Tests**: Store and permission-deny handler tests per plan.

---

## Phase 1: Setup

**Purpose**: Shared types and validation for GitHub events JSON

- [x] T001 [P] Add `GithubEvents` zod schema and type in `src/lib/config/github-events.ts`
- [x] T002 [P] Export store types from `src/lib/config/guild-config-types.ts` if needed for handlers (optional thin types file)

---

## Phase 2: Foundational (Blocking)

**Purpose**: Extend `GuildConfigStore` before slash handlers

- [x] T003 Implement `getThunderstore`, `upsertThunderstore` in `src/lib/config/guild-config-store.ts`
- [x] T004 Implement `getGithub`, `upsertGithub` in `src/lib/config/guild-config-store.ts` (validate ≥1 event true)
- [x] T005 [P] Unit tests for Thunderstore upsert in `src/lib/config/guild-config-store.test.ts`
- [x] T006 [P] Unit tests for GitHub upsert + reject-all-false in `src/lib/config/guild-config-store.test.ts`

**Checkpoint**: Store CRUD testable without Discord

---

## Phase 3: User Story 1 — Server staff configure watchers (Priority: P1) 🎯 MVP

**Goal**: `/thunderstore setup` and `/github setup` persist config with permission gates

**Independent Test**: [quickstart.md](./quickstart.md) QS1–QS2

### Tests for User Story 1

- [x] T007 [P] [US1] Handler test deny without permission in `src/bot/handlers/thunderstore-setup.test.ts`
- [x] T008 [P] [US1] Handler test deny without permission in `src/bot/handlers/github-setup.test.ts`

### Implementation for User Story 1

- [x] T009 [US1] Implement `createThunderstoreSetupHandler` in `src/bot/handlers/thunderstore-setup.ts` per [contracts/thunderstore-setup.md](./contracts/thunderstore-setup.md)
- [x] T010 [US1] Implement `createGithubSetupHandler` in `src/bot/handlers/github-setup.ts` per [contracts/github-setup.md](./contracts/github-setup.md)
- [x] T011 [US1] Add slash command builders and export definitions in `src/bot/commands/watcher-config-commands.ts`
- [x] T012 [US1] Extend `deployPlatformCommands` → `deployBotCommands` in `src/bot/register-commands.ts` to register thunderstore + github (+ keep platform-smoke)
- [x] T013 [US1] Wire handlers on `InteractionRouter` in `src/bot/handlers/interaction-create.ts`
- [x] T014 [US1] Update `src/deploy-commands.ts` to call expanded deploy function

**Checkpoint**: QS1 manual — setup persists, unauthorized denied

---

## Phase 4: Polish

- [x] T015 [P] Add QS1–QS2 steps to [quickstart.md](./quickstart.md) if adjusted during implement
- [x] T016 Verify Tier 0: `pnpm test && pnpm run lint && pnpm run build`
- [x] T017 [P] Update [CHANGELOG.md](../../CHANGELOG.md) under `[Unreleased]` for new setup commands

---

## Dependencies & Execution Order

| Phase | Blocks |
|-------|--------|
| 1 Setup | Phase 2 |
| 2 Foundational | Phase 3 |
| 3 US1 | Phase 4 |

### Parallel opportunities

- T001–T002 parallel
- T005–T006 after T003–T004
- T007–T008 parallel; T009–T010 parallel after store done

---

## Implementation Strategy

**MVP**: Phase 1 + 2 + 3 (US1) — enables specs 004/005.

**Branch**: Create `003-guild-watcher-config` from `main` before implement (Spec Kit convention).

---

## Notes

- Do not implement watcher poll, webhooks, or announcements (004/005).
- Reuse `PermissionResolver` and `InteractionRouter` from 002; do not add worker processors.
