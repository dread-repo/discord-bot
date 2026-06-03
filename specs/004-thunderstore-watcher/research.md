# Research: Thunderstore Watcher (004)

**Feature**: `004-thunderstore-watcher`  
**Date**: 2026-06-02

## R1: Thunderstore HTTP API

**Decision**: Use public Thunderstore API `GET https://thunderstore.io/api/v1/package/{namespace}/{name}/` for latest version metadata and changelog fields. Parse with zod; treat non-200 as transient (retry with exponential backoff, max 3 attempts per package per poll).

**Rationale**: Epic R5 — no webhook; polling is the only integration. Community API is stable and returns `versions[]` with `version_number`, `changelog`, `date_created`.

**Alternatives considered**:
- Thunderstore experimental GraphQL: rejected — undocumented for production bot.
- Scraping HTML: rejected — brittle.

## R2: Poll scheduling

**Decision**: On worker startup, enqueue initial `{ kind: 'poll' }` to `watcher:thunderstore`, then use BullMQ **repeatable job** (or `setInterval` in worker scheduling module) every `THUNDERSTORE_POLL_INTERVAL_MS` (default `600_000` = 10 min, env override).

**Rationale**: Keeps poll logic inside existing queue contract; worker process already owns consumers.

**Alternatives considered**:
- `node-cron` only: rejected — duplicates BullMQ routing already in platform.
- Bot-side poll: rejected — violates 002 process split.

## R3: Version detection

**Decision**: Compare latest API version string to last-seen in-memory cache per process **and** `WatcherDedupeStore` before enqueueing `kind: 'announce'`. Dedupe key: `ts:{namespace}/{name}@{version}` (matches existing test convention).

**Rationale**: FR-005, SC-002; DB dedupe survives worker restarts.

## R4: Announce fan-out

**Decision**: `thunderstore-announce` processor loads all `guild_thunderstore_config` rows (via `GuildConfigStore` list method), posts Container message to each `channelId`, content includes `<@&pingRoleId>` mention in message content (allowed in text channel posts).

**Rationale**: FR-002; one job per new version fans out to all guilds (job payload carries packageKey + version; processor resolves guild list).

**Alternatives considered**:
- Per-guild queue jobs: deferred — simpler v1 fan-out in one processor; split if guild count > 100.

## R5: Oversized changelog

**Decision**: If `body.length > MAX_BODY_CHARS` (3500), enqueue `llm:changelog-summarize` with `source: 'thunderstore'` and `announceMeta`; announce processor waits for summarize result **or** posts with truncated body + `bodyIsLlmSummary: true` when `LlmGateway` still stub (v1: enqueue summarize job; processor stub logs until LLM wired — **platform smoke path** uses stub). For 004 MVP: if LLM unavailable, post labeled truncation message per container contract.

**Rationale**: FR-006; epic container contract requires LLM label when summarized.

## R6: Global package registration

**Decision**: `/plugin register` subcommand on command name `plugin`; permission `globalPluginRegister` (official guild + Administrator). Calls `GlobalPackageRegistry.register(namespace, name, isCore, githubRepo?, userId)` inserting `global_packages` with unique `(namespace, name)`.

**Rationale**: Epic slash table; `PermissionResolver` already has `globalPluginRegister` action.

## R7: GitHub release URL on announcements

**Decision**: When manifest/registry row has `githubRepo`, resolve release tag URL pattern `https://github.com/{owner}/{repo}/releases/tag/{version}` for button (best-effort; omit button if repo missing).

**Rationale**: FR-004; Thunderstore URL always `https://thunderstore.io/c/{namespace}/p/{name}/v/{version}/`.
