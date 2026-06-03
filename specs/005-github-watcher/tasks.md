# Tasks: GitHub Watcher

**Input**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/) · [research.md](./research.md) · [quickstart.md](./quickstart.md)

**Branch**: `005-github-watcher`

**Depends on**: [002](../002-core-platform/tasks.md), [003](../003-guild-watcher-config/tasks.md) on `main`; reuses [004](../004-thunderstore-watcher/) `DiscordRestPoster` pattern

---

## Phase 1: Setup

**Purpose**: Env, dedupe keys, shared types

- [X] T001 Add `WEBHOOK_PORT` to worker env schema in `src/lib/env.ts` (default `61952`)
- [X] T002 [P] Add dedupe helper `gh:{deliveryId}` in `src/lib/watchers/github-dedupe.ts`
- [X] T003 [P] Add GitHub webhook/event zod types in `src/lib/watchers/github-types.ts`

---

## Phase 2: Foundational (Blocking)

**Purpose**: Verify, map, list guilds — before HTTP and announce

- [X] T004 Add `listGithubGuilds()` on `GuildConfigStore` in `src/lib/config/guild-config-store.ts`
- [X] T005 Implement HMAC verification in `src/lib/watchers/github-webhook-verify.ts`
- [X] T006 Implement `mapGithubWebhook` in `src/lib/watchers/github-event-mapper.ts` per [contracts/event-mapping.md](./contracts/event-mapping.md)
- [X] T007 [P] Align `GitHubWatchJob.event` union in `src/lib/queue/queue-types.ts` with `ci` (not `workflow_run`)
- [X] T008 [P] Unit tests: verify + mapper + dedupe in `src/lib/watchers/github-webhook-verify.test.ts`, `github-event-mapper.test.ts`, `github-dedupe.test.ts`
- [X] T009 [P] Add JSON fixtures under `src/lib/watchers/fixtures/github/` for push, release, workflow_run

**Checkpoint**: Mapper returns internal events; no HTTP yet

---

## Phase 3: User Story 1 — Community receives GitHub updates (Priority: P1) 🎯 MVP

**Goal**: Webhook → queue → dedupe → announce (no ping)

**Independent Test**: [quickstart.md](./quickstart.md) QS3

### Implementation for User Story 1

- [X] T010 [US1] Implement worker HTTP server in `src/worker/http.ts` per [contracts/github-http.md](./contracts/github-http.md)
- [X] T011 [US1] Wire `POST /webhooks/github` to verify, map, enqueue `watcher:github`
- [X] T012 [US1] Extend `DiscordRestPoster` with `postAnnounceWithoutPing` or optional ping in `src/lib/discord/discord-rest-poster.ts`
- [X] T013 [US1] Implement `github-announce` processor in `src/worker/processors/github-announce.ts`
- [X] T014 [US1] Wire processor in `src/worker/register-processors.ts` for `watcher:github` (replace stub)
- [X] T015 [US1] Start HTTP server from `src/worker.ts`; pass deps via `src/worker/github-deps.ts` (mirror `thunderstore-deps.ts`)
- [X] T016 [US1] Enqueue `llm:changelog-summarize` when body exceeds `MAX_BODY_CHARS` in `github-announce.ts` (truncation fallback)

**Checkpoint**: QS3 — fixture webhooks post once; dedupe on replay

---

## Phase 4: Polish & Cross-Cutting

- [X] T017 [P] Document production webhook via Cloudflare Tunnel in `docs/development.md`; bind worker `127.0.0.1:61952:61952` in `docker-compose.yml` per [contracts/deployment-cloudflare-tunnel.md](./contracts/deployment-cloudflare-tunnel.md)
- [X] T018 [P] Integration-style test: HTTP handler enqueues job (mock `JobQueue`) in `src/worker/http.test.ts`
- [X] T019 Verify Tier 0: `pnpm test && pnpm run lint && pnpm run build`
- [X] T020 [P] Update [CHANGELOG.md](../../CHANGELOG.md) `[Unreleased]` for GitHub watcher

---

## Dependencies & Execution Order

| Phase | Blocks |
|-------|--------|
| 1 Setup | 2 |
| 2 Foundational | 3 |
| 3 US1 (MVP) | 4 |

### Parallel opportunities

- T002–T003, T007–T009, T017–T018 parallel where marked

---

## Implementation Strategy

**MVP**: Phases 1–3 (US1) — webhook ingest + per-guild announces.

**Commits**: One commit per task — stage task files, then [spec-kit-implement-commits.md](../../docs/agents/spec-kit-implement-commits.md) / `commit-task.sh T###` on branch `005-github-watcher`.

---

## Notes

- Do not implement Thunderstore poll (004).
- Do not add per-guild custom GitHub repos.
- Reuse `GITHUB_REPO` from `src/lib/constants.ts`.
