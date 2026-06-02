# Research: Dread Community Discord Bot

**Feature**: `001-dread-community-bot`  
**Date**: 2026-06-02

## R1: Discord.js and Components v2 (Container messages)

**Decision**: Use **discord.js v14.19+** (latest stable) with `MessageFlags.IsComponentsV2` and container/display component builders for all public messages.

**Rationale**: Spec mandates Container v2 only. Discord.js documents Components v2 under display components; slash interactions still use the interaction API with defer/reply/editReply within 3 seconds.

**Alternatives considered**:
- Raw Discord REST: rejected — loses type safety and event ergonomics.
- discord.py: rejected — repo is TypeScript/Node with existing toolchain.

**Implementation notes**:
- Centralize layout in `ContainerMessageBuilder` so watchers, utilities, forum, and moderation share one template contract.
- Link buttons use `ButtonStyle.Link` with Thunderstore/GitHub URLs from package manifest.
- Ephemeral flows use `InteractionReplyOptions({ flags: Ephemeral })` for announcement drafts.

## R2: Job queue (Redis + BullMQ)

**Decision**: **BullMQ 5.x** on **self-hosted Redis 7** (Docker Compose). Separate `bot` and `worker` processes share one image, different commands.

**Rationale**: Meets FR-026; keeps gateway path fast; matches PRD Docker layout already committed.

**Alternatives considered**:
- In-process queue: rejected — blocks event loop under LLM/repo scan load.
- Supabase Queues/pg_cron: rejected — Redis is standard for BullMQ; Postgres reserved for durable config/state.

**Queues**:
| Queue | Producer | Consumer |
|-------|----------|----------|
| `watcher:thunderstore` | worker cron | worker |
| `watcher:github` | HTTP webhook → worker | worker |
| `llm:changelog-summarize` | announce processor | worker |
| `llm:announcement-review` | bot interaction | worker |
| `forum:post-pipeline` | bot event | worker |
| `index:repo-scan` | forum pipeline | worker |
| `llm:dread-reply` | bot message event | worker |

## R3: Persistence (Supabase Postgres)

**Decision**: **Supabase** with SQL migrations in `supabase/migrations/`; bot/worker use **service role** server-side only (no anon client in v1).

**Rationale**: Multi-guild config, dedupe state, forum attempts, global packages; aligns with user-requested supabase-postgres-best-practices skill.

**Alternatives considered**:
- SQLite per guild: rejected — multi-instance bot/worker needs shared state.
- Redis-only state: rejected — durable config and audit trail need Postgres.

**Postgres practices**: Index `guild_id`; unique constraints on dedupe keys; short transactions; RLS optional v1 (service role bypass) — add RLS in v2 if exposing client.

## R4: LLM provider

**Decision**: **Provider-agnostic adapter** via env (`LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`) with OpenAI-compatible API as default implementation.

**Rationale**: Spec requires summarize, announcement review, repo classify, forum answer, dread reply — one gateway with budget counters.

**Alternatives considered**:
- Hardcode OpenAI only: rejected — limits deployment choice.
- Multiple parallel SDKs: rejected — maintain one HTTP adapter.

**Gating**: `LlmGateway.budgetOk()` checks daily token estimate; forum codebase step skipped when false (FR-020).

## R5: Thunderstore integration

**Decision**: Poll Thunderstore HTTP API on interval from worker; package list = `config/official-packages.json` ∪ `global_packages` table.

**Rationale**: No webhook from Thunderstore; manifest + global register command per spec.

**Alternatives considered**:
- Scrape HTML: rejected — brittle.

## R6: GitHub integration

**Decision**: **GitHub webhooks** to worker HTTP server (`POST /webhooks/github`); HMAC verify with `GITHUB_WEBHOOK_SECRET`; repo fixed `dread-repo/dreadREPO`.

**Rationale**: Real-time events; per-guild filtering by enabled event types in DB.

## R7: Forum codebase assistance

**Decision**: **Tag → LLM classifier → `/support repo` fallback**; scan via shallow `git clone` to temp dir or GitHub Trees API when rate limits apply.

**Rationale**: Matches spec FR-021; store attempts in `forum_attempts` for thread continuity.

## R8: Permissions model

**Decision**: Single `PermissionResolver` with actions: `config`, `moderate`, `globalPluginRegister`, `setBotAdmin`, `officialForumRegister`.

**Rationale**: Prevents global admin moderating abroad (FR-016); official guild ID `1510452344024727775` hardcoded.

## R9: Testing strategy

**Decision**: **Vitest** unit tests at module boundaries; **fixture-driven** tests for GitHub webhook payloads and Container snapshots; no live Discord in CI (Tier 0).

**Rationale**: AGENTS.md Tier 0; greenfield repo already has Vitest.
