# Implementation Plan: Dread Community Discord Bot

**Branch**: `001-dread-community-bot` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-dread-community-bot/spec.md`

## Summary

Build a multi-guild Discord bot for the dread-repo community: Thunderstore and GitHub announcement watchers, LLM-assisted staff announcements, official-guild support forum automation, guild-scoped moderation, utility commands, and optional in-character Dread replies. All public output uses **Components v2 (Container)** messages. **Bot** and **worker** processes share a Docker image; **BullMQ** on **Redis** runs heavy work; **Supabase Postgres** stores guild config and dedupe state.

## Technical Context

**Language/Version**: TypeScript 5.8+ on Node.js 22+

**Primary Dependencies**: discord.js 14.19+, bullmq 5.x, ioredis 5.x, @supabase/supabase-js 2.x, zod 3.x (validation), undici (HTTP)

**Storage**: Supabase Postgres (config, dedupe, forum attempts, drafts); Redis (queues); bundled JSON in `config/`

**Testing**: Vitest (unit + snapshot); fixture tests for webhooks and Container builder

**Target Platform**: Linux VPS (Docker Compose: bot, worker, redis)

**Project Type**: Multi-process Discord bot (gateway + worker + webhook sidecar)

**Performance Goals**: Interaction ack &lt; 3s; announcement LLM feedback &lt; 30s p95; forum FAQ+duplicate &lt; 60s p95

**Constraints**: Container v2 only for public messages; official guild `1510452344024727775`; GitHub repo `dread-repo/dreadREPO`; pnpm minimumReleaseAge 7 days

**Scale/Scope**: Multi-guild (10–100 guilds v1); single GitHub repo; O(50) Thunderstore packages

## Constitution Check

*GATE: Constitution template not yet ratified — applying AGENTS.md and PRD norms.*

| Gate | Status | Notes |
|------|--------|-------|
| Testable modules | PASS | Deep modules with narrow interfaces (PRD) |
| Tier 0 verify | PASS | `pnpm test` + `pnpm run lint` on every PR |
| No secrets in repo | PASS | `.env` gitignored |
| Minimal scope | PASS | Out of scope documented in spec |
| Spec Kit branch | PASS | `001-dread-community-bot` |

**Post-design**: PASS — data model and contracts align with FR-001–FR-027.

## Project Structure

### Documentation (this feature)

```text
specs/001-dread-community-bot/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── tasks.md
├── PRD.md
└── checklists/
```

### Source Code (repository root)

```text
src/
├── bot/
│   ├── index.ts                 # Gateway entry
│   ├── client.ts                # Discord Client setup
│   ├── register-commands.ts     # Slash command registration
│   └── handlers/
│       ├── interaction-create.ts
│       └── message-create.ts    # Dread reply trigger
├── worker/
│   ├── index.ts                 # Worker entry
│   ├── http.ts                  # GitHub webhook server
│   └── processors/              # BullMQ job handlers
├── lib/
│   ├── permissions/
│   ├── messages/                # ContainerMessageBuilder
│   ├── config/                  # GuildConfigStore, JSON loaders
│   ├── packages/                # GlobalPackageRegistry
│   ├── dedupe/
│   ├── queue/
│   ├── llm/
│   ├── watchers/
│   ├── forum/
│   ├── announcements/
│   └── commands/                # Slash command defs + execute
config/
├── official-packages.json
├── faq.json
├── repo-tag-map.json
├── features.json
├── readme.json
├── downloads.json
└── dread-persona.md
supabase/
└── migrations/
tests/
├── unit/
├── fixtures/
└── snapshots/
```

**Structure Decision**: Single TypeScript package, split **bot** vs **worker** entrypoints (already in Docker). Shared code under `src/lib/` imported by both processes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Two processes | FR-026 interaction time limits | Single process blocks on LLM/repo scan |
| Supabase + Redis | Durable config vs ephemeral queues | Redis-only loses audit; Postgres-only poor queue fit |

## Phase mapping (implementation)

| Phase | Spec stories | Deliverable |
|-------|--------------|-------------|
| Foundational | — | Client, DB, queue, permissions, Container builder |
| P1 | US1, US2, US3 | Config + watchers |
| P2 | US4–US7 | Announcements, forum, mod, plugins |
| P3 | US8, US9 | Dread replies + utilities |

See [tasks.md](./tasks.md) for ordered checklist.
