# Implementation Plan: Thunderstore Watcher & Global Packages

**Branch**: `004-thunderstore-watcher` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: [spec.md](./spec.md) · [002](../002-core-platform/plan.md) · [003](../003-guild-watcher-config/plan.md) · Epic [job-queues](../001-dread-community-bot/contracts/job-queues.md) · [container-message](../001-dread-community-bot/contracts/container-message.md)

## Summary

Poll Thunderstore for new versions of manifest ∪ `global_packages` entries, dedupe by package version, enqueue per-guild Discord announcements (Container messages with ping role), and optionally summarize oversized changelogs via `llm:changelog-summarize`. Official-guild admins register global packages with `/plugin register`.

## Technical Context

**Language/Version**: TypeScript 5.8+ on Node.js 22+

**Primary Dependencies**: discord.js 14 (REST for channel posts), BullMQ 5, Prisma 6, zod 3, existing `GlobalPackageRegistry`, `GuildConfigStore`, `WatcherDedupeStore`, `ContainerMessageBuilder`, `JobQueue`, `LlmGateway` (summarize path)

**Storage**: `global_packages`, `watcher_dedupe`, `guild_thunderstore_config` (read via `GuildConfigStore.getThunderstore`)

**Testing**: Vitest — HTTP client mocked, dedupe key builder, announce processor with mocked Discord REST + stores

**Target Platform**: **Worker** for poll + announce processors; **bot** for `/plugin register` only

**Performance Goals**: Poll interval configurable (default 5–10 min); announce fan-out per guild sequential or small concurrency; no duplicate posts for same version key

**Constraints**: No GitHub webhooks (005); use epic queue names; BullMQ Redis names via `toBullMqQueueName()`; MAX_BODY_CHARS 3500 from `announce-meta.ts`

**Scale/Scope**: O(50) packages × N guilds with Thunderstore config; single Thunderstore HTTP client with backoff

## Constitution Check

| Gate | Status |
|------|--------|
| Depends on 002 + 003 | PASS — queues, stores, builder, guild config |
| Tier 0 verify | PASS — unit tests + `pnpm test` / lint / build |
| Minimal scope | PASS — no GitHub watcher, no forum |
| Epic contracts | PASS — documented under `contracts/` |

## Project Structure

```text
src/
├── lib/
│   ├── watchers/
│   │   ├── thunderstore-client.ts      # HTTP fetch package versions
│   │   ├── thunderstore-types.ts       # API response zod schemas
│   │   └── thunderstore-dedupe.ts      # dedupe key: ts:{ns}/{name}@{version}
│   └── packages/
│       └── global-package-registry.ts  # implement register()
├── worker/
│   ├── schedule/
│   │   └── thunderstore-poll.ts        # repeatable poll job enqueue
│   └── processors/
│       ├── thunderstore-poll.ts        # watcher:thunderstore kind=poll
│       └── thunderstore-announce.ts    # kind=announce → Discord posts
├── bot/
│   ├── commands/
│   │   └── plugin-register-commands.ts
│   └── handlers/
│       └── plugin-register.ts
```

**Documentation (this feature)**:

```text
specs/004-thunderstore-watcher/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── tasks.md
└── checklists/
```

## Phase mapping

| Deliverable | User story |
|-------------|------------|
| Thunderstore poll + announce pipeline | US1 (P1) |
| `/plugin register` | US2 (P2) |
| QS2 quickstart | US1 |

## Complexity Tracking

None — follows epic patterns from 001 research R5.
