# Implementation Plan: Core Platform

**Branch**: `002-core-platform` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: [spec.md](./spec.md) · Epic [data-model](../001-dread-community-bot/data-model.md) · [PRD](../001-dread-community-bot/PRD.md) persistence section

## Summary

Deliver the shared runtime for the Dread Community bot: Docker Compose (bot, worker, Redis), Prisma on Supabase Postgres (full epic schema), BullMQ job queues, Discord client + interaction router, PermissionResolver, ContainerMessageBuilder, guild/dedupe stores, GlobalPackageRegistry skeleton, LlmGateway skeleton, config JSON stubs, and env validation. No watcher or feature slash commands beyond smoke tests.

## Technical Context

**Language/Version**: TypeScript 5.8+ on Node.js 22+

**Primary Dependencies**: discord.js 14.19+, bullmq 5.x, ioredis 5.x, prisma 7.x, @prisma/client, @prisma/adapter-pg, pg, zod 3.x

**Storage**: Supabase Postgres via Prisma ([ADR-0002](../../docs/adr/0002-prisma-on-supabase-postgres.md)); Redis queues; `config/*.json` stubs

**Testing**: Vitest — PermissionResolver matrix, ContainerMessageBuilder snapshots, queue enqueue mock, store unit tests

**Target Platform**: Linux VPS (Docker Compose)

**Project Type**: Dual-process Node service (bot gateway + background worker)

**Performance Goals**: Discord interaction ack within 3s; job pickup within test-bounded latency (seconds, not minutes)

**Constraints**: Interaction ack &lt; 3s; official guild + GitHub repo constants; pnpm `minimumReleaseAge` 7 days; fail-fast on missing env/DB/Redis

**Scale/Scope**: Multi-guild bot; full schema upfront; platform modules only (no watcher/forum/moderation feature logic)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Pre-design | Post-design |
|------|------------|-------------|
| Testable modules | PASS | PASS — contracts define unit/integration boundaries |
| Tier 0 verify (`pnpm test`, `pnpm run lint`) | PASS | PASS |
| No secrets in repo | PASS | PASS — env contract only |
| Minimal scope | PASS | PASS — smoke command only; features 003–010 deferred |
| ADR-0002 Prisma on Supabase | PASS | PASS — full init migration, dual URL |

No unjustified violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-core-platform/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1 (platform store scope)
├── quickstart.md        # Phase 1 acceptance
├── contracts/           # Phase 1 platform contracts
│   ├── env-validation.md
│   ├── permission-resolver.md
│   ├── platform-interfaces.md
│   └── smoke.md
├── spec.md
└── tasks.md             # /speckit-tasks
```

Epic-shared contracts remain under [../001-dread-community-bot/contracts/](../001-dread-community-bot/contracts/) (job queues, container layout, slash catalog).

### Source Code (repository root)

```text
src/
├── bot/          # index, client, register-commands, handlers
├── worker/       # index, http stub, processors/ (stubs)
├── lib/
│   ├── db/prisma.ts
│   ├── env.ts
│   ├── constants.ts
│   ├── config/   # load-bundled, guild-config-store
│   ├── dedupe/
│   ├── permissions/
│   ├── messages/
│   ├── queue/
│   ├── llm/
│   └── packages/
prisma/
├── schema.prisma
└── migrations/
config/           # JSON + dread-persona.md stubs
```

**Structure Decision**: Monorepo single package; bot and worker entries at `src/index.ts` and `src/worker.ts` evolve into thin bootstraps delegating to `src/bot/` and `src/worker/`.

## Phase mapping

| Deliverable | Child specs unblocked |
|-------------|------------------------|
| Prisma schema + migrate | All |
| Bot + worker + Redis | All |
| PermissionResolver + Container builder | 003–010 |
| GuildConfigStore + WatcherDedupeStore | 003–005, 009 |
| Job queue + worker stubs | 004–007, 009 |
| LlmGateway + config stubs | 006, 007, 009 |

## Complexity Tracking

| Item | Why | Simpler alternative rejected |
|------|-----|------------------------------|
| Two processes | FR-001/FR-006 — interaction time limits | Single process blocks on LLM/git |
| Prisma + Redis | Durable state vs ephemeral queues | Redis-only loses config audit trail |
| Full schema in 002 | One migration path | Per-spec migrations risk drift |

## Phase 0 & 1 outputs

- [research.md](./research.md) — platform decisions (process layout, stores, queue registry, smoke, env)
- [data-model.md](./data-model.md) — store scope vs epic canonical tables
- [contracts/](./contracts/) — env, permissions, interfaces, smoke
- [quickstart.md](./quickstart.md) — QS-P1–P5

Next: `/speckit-tasks` to generate or refresh [tasks.md](./tasks.md).
