# Implementation Plan: GitHub Watcher

**Branch**: `005-github-watcher` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: [spec.md](./spec.md) · [002](../002-core-platform/plan.md) · [003](../003-guild-watcher-config/plan.md) · Epic [github-webhook](../001-dread-community-bot/contracts/github-webhook.md) · [container-message](../001-dread-community-bot/contracts/container-message.md)

## Summary

Accept GitHub webhooks for `dread-repo/dreadREPO` on the worker HTTP server, verify HMAC signatures, map payloads to internal event types, enqueue `watcher:github` jobs, dedupe by delivery id, and post Container announcements to guilds that enabled each event via spec 003—no role pings. Oversized bodies enqueue `llm:changelog-summarize` with truncation fallback (same pattern as 004).

## Technical Context

**Language/Version**: TypeScript 5.8+ on Node.js 22+

**Primary Dependencies**: Node `http` (or minimal router), crypto (HMAC SHA-256), BullMQ 5, discord.js REST (`DiscordRestPoster` from 004), `GuildConfigStore`, `WatcherDedupeStore`, `ContainerMessageBuilder`, `JobQueue`, `GITHUB_REPO` constant

**Storage**: `guild_github_config` (read), `watcher_dedupe` (write `gh:{deliveryId}`)

**Testing**: Vitest — signature verification, event mapping fixtures for all six internal event types, HTTP enqueue test, announce processor with mocked stores + REST (`github-announce.test.ts`)

**Target Platform**: **Worker** only (HTTP + BullMQ processors); bot unchanged except docs

**Performance Goals**: Webhook handler returns `200` within 1s after enqueue; fan-out per guild sequential; GitHub redelivery safe via dedupe

**Constraints**: Repo filter `dread-repo/dreadREPO`; internal event keys match `githubEventsSchema` (`ci` not `workflow_run` in jobs); `WEBHOOK_PORT` default `61952`; no Thunderstore poll (004)

**Production deployment**: Arch Linux host runs `docker compose` (bot, worker, redis). GitHub webhook URL is public via **Cloudflare Tunnel** (`cloudflared`) → `127.0.0.1:61952` on the host (worker port mapped to loopback only). See [contracts/deployment-cloudflare-tunnel.md](./contracts/deployment-cloudflare-tunnel.md).

**Scale/Scope**: Single repo; O(guilds with GitHub config) announce posts per delivery

## Constitution Check

| Gate | Status |
|------|--------|
| Depends on 002 + 003 | PASS |
| Tier 0 verify | PASS |
| Minimal scope | PASS — no custom repos, no forum |
| Epic contracts | PASS — under `contracts/` |

## Project Structure

```text
src/
├── lib/
│   ├── watchers/
│   │   ├── github-dedupe.ts           # gh:{deliveryId}
│   │   ├── github-webhook-verify.ts   # HMAC SHA-256
│   │   ├── github-event-mapper.ts     # payload → internal event + body
│   │   └── github-types.ts            # MappedGithubEvent + internal event union
│   └── config/
│       └── guild-config-store.ts      # listGithubGuilds()
├── worker/
│   ├── http.ts                        # POST /webhooks/github
│   └── processors/
│       └── github-announce.ts         # watcher:github consumer (ingest in http.ts)
```

**Documentation (this feature)**:

```text
specs/005-github-watcher/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── deployment-cloudflare-tunnel.md
│   ├── github-http.md
│   └── …
├── tasks.md
└── checklists/
```

## Phase mapping

| Deliverable | User story |
|-------------|------------|
| Webhook ingest + queue | US1 (P1) |
| Per-guild announce | US1 |
| QS3 quickstart | US1 |

## Production topology (Arch + Docker + Cloudflare Tunnel)

```text
┌──────────────── Arch Linux host ────────────────┐
│  docker compose: bot | worker | redis           │
│  worker ports: 127.0.0.1:61952 → container :61952 │
│  cloudflared → http://127.0.0.1:61952             │
└─────────────────────────────────────────────────┘
         ▲                           │
         │ outbound tunnel           │ Supabase (DATABASE_URL)
         │                           ▼
   Cloudflare edge              Discord API
         ▲
         │ HTTPS POST /webhooks/github
     GitHub (dread-repo/dreadREPO)
```

## Complexity Tracking

None — mirrors 004 announce fan-out without ping role. Tunnel config is ops/docs only (not application code).
