# Research: GitHub Watcher (005)

**Feature**: `005-github-watcher`  
**Date**: 2026-06-02

## R1: HTTP server placement

**Decision**: Minimal Node `http.createServer` in `src/worker/http.ts`, started from `src/worker.ts` alongside BullMQ workers. Single route `POST /webhooks/github`; `404` elsewhere.

**Rationale**: Epic and 002 plan — webhooks hit worker, not bot gateway. Avoid new framework dependency.

**Alternatives considered**:
- Bot gateway route: rejected — couples webhook load to Discord session.
- Fastify/Express: deferred — YAGNI for one route.

## R2: Signature verification

**Decision**: Verify `X-Hub-Signature-256` with `GITHUB_WEBHOOK_SECRET` using HMAC SHA-256 (`sha256=<hex>`). If secret unset in dev, log warning and accept (document in quickstart); production MUST set secret.

**Rationale**: FR-002; GitHub documented header format.

## R3: Repository filter

**Decision**: Parse JSON body; proceed only when `repository.full_name === GITHUB_REPO` (`dread-repo/dreadREPO`). Wrong repo → `404` (no enqueue).

**Rationale**: FR-001; prevents noise from fork webhooks misconfigured on same endpoint.

## R4: Event mapping

**Decision**: Map GitHub `X-GitHub-Event` + payload to internal keys aligned with `GithubEvents` from 003:

| GitHub | Filter | Internal `event` |
|--------|--------|------------------|
| `push` | `ref === refs/heads/master` or `main` | `push` |
| `pull_request` | `action` in opened, closed, merged | `pull_request` |
| `workflow_run` | completed, default branch | `ci` |
| `release` | `action === published` | `release` |
| `issues` | opened, closed | `issues` |
| `deployment_status` | success or failure | `deployment` |

Unmapped combinations: log at debug, return `200` without enqueue.

**Rationale**: Guild toggles use `ci`, not `workflow_run`; keeps `GuildConfigStore` JSON shape stable.

## R5: Dedupe

**Decision**: Dedupe key `gh:{X-GitHub-Delivery}` via `WatcherDedupeStore.tryInsert` in announce processor (same pattern as 004). HTTP handler always returns `200` after enqueue attempt for valid repo + signature.

**Rationale**: FR-006; GitHub retries on non-2xx.

## R6: Announce fan-out

**Decision**: `github-announce` processor loads `listGithubGuilds()`, filters `events[event] === true`, posts via `DiscordRestPoster` **without** role mention (content only + embed). Release events add Thunderstore button when core package URL known from manifest.

**Rationale**: FR-004, FR-005; mirror 004 REST poster without ping.

## R7: Oversized body

**Decision**: Same as 004 — if formatted body &gt; `MAX_BODY_CHARS`, enqueue `llm:changelog-summarize` with `source: 'github'` and truncate for immediate post until LLM wired.

**Rationale**: FR-007.

## R8: Production TLS / public URL (Cloudflare Tunnel)

**Decision**: Production on **Arch Linux + Docker Compose** exposes the worker HTTP server only on **host loopback** (`127.0.0.1:WEBHOOK_PORT`). **Cloudflare Tunnel** (`cloudflared`) on the host maps `https://hooks.<domain>/` → `http://127.0.0.1:61952`. TLS terminates at Cloudflare; no inbound firewall port for webhooks.

**Rationale**: Maintainer hosts bot on Arch with Docker; Tunnel is free, outbound-only, and avoids router/nginx cert management. Application code unchanged — still Node `http` on the worker container.

**Alternatives considered**:
- Caddy/nginx on host :443: valid; document as alternative in [deployment-cloudflare-tunnel.md](./contracts/deployment-cloudflare-tunnel.md).
- Cloudflare Worker at edge: rejected for v1 — would fork architecture away from Docker worker + BullMQ.
- Expose webhook port on `0.0.0.0`: rejected — security risk; use loopback + tunnel only.
