# Quickstart: GitHub Watcher (005)

**Prerequisites**: 002 + 003 on `main`, test guild with `/github setup`, Redis + Postgres + worker running.

## QS3 — GitHub announce (US1)

1. Configure `/github setup` with `#announce` and enable **push** + **release** (or all events under test).
2. Set env:
   - `GITHUB_WEBHOOK_SECRET` — same as GitHub App/webhook secret
   - `WEBHOOK_PORT=61952` (default)
   - `DISCORD_TOKEN` on worker (posts via REST, same as 004)
3. Start worker: `pnpm run start:worker` (HTTP + BullMQ).
4. Send fixture webhook (from dev machine):

```bash
# Example: use signed payload helper or `gh api` hook delivery replay
curl -X POST "http://127.0.0.1:61952/webhooks/github" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-GitHub-Delivery: test-delivery-$(date +%s)" \
  -H "X-Hub-Signature-256: sha256=<computed>" \
  -d @src/lib/watchers/fixtures/github/push-master.json
```

5. Observe **one** Container message in configured channel — **no** role ping.
6. Repeat same `X-GitHub-Delivery` → **no** second message (dedupe).
7. Send `release` fixture → GitHub button; Thunderstore button when release maps to core package version URL.

**Pass**: Format matches [container-message](../../001-dread-community-bot/contracts/container-message.md); dedupe holds.

## Production (Arch + Docker + Cloudflare Tunnel)

Full steps: [contracts/deployment-cloudflare-tunnel.md](./contracts/deployment-cloudflare-tunnel.md).

1. Deploy `docker compose` on Arch; worker published as `127.0.0.1:61952:61952`.
2. Run **cloudflared** named tunnel: `hooks.<your-domain>` → `http://127.0.0.1:61952`.
3. GitHub webhook on `dread-repo/dreadREPO`:

```text
https://hooks.<your-domain>/webhooks/github
```

4. `GITHUB_WEBHOOK_SECRET` in `.env` matches GitHub; `/github setup` in each guild.

Smoke: `curl https://hooks.<your-domain>/health` (after health route ships).

## Tier 0

```bash
pnpm test && pnpm run lint && pnpm run build
```
