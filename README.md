# discord-bot

Discord bot for the [dread-repo](https://github.com/dread-repo) org. Agent and spec tooling follow patterns from [dreadREPO](https://github.com/dread-repo/dreadREPO).

Active feature: [001-dread-community-bot](specs/001-dread-community-bot/) (watchers, config commands, Prisma on Supabase Postgres).

## Setup guide

End-to-end guide for **local development**, **GitHub webhooks (smee.io)**, and **production-style hosting** (Docker + optional Cloudflare Tunnel). The **`worker`** in this repo is a **Node.js process** (BullMQ + HTTP), not a [Cloudflare Worker](https://developers.cloudflare.com/workers/) script.

### Architecture

```text
GitHub ──POST──► public HTTPS URL ──► worker:3000/webhooks/github ──► Redis (BullMQ)
Discord ◄──WebSocket── bot ◄──────────────────────────────────────► Prisma ──► Supabase Postgres
```

| Process | Entry | Purpose |
|---------|--------|---------|
| `bot` | `pnpm start:bot` | Discord gateway, slash commands |
| `worker` | `pnpm start:worker` | Job queues + GitHub webhook HTTP server |
| `redis` | Docker service | BullMQ backend |

---

### 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ (see `.node-version`) |
| pnpm | 11+ (`corepack enable`) |
| Docker | For Redis + optional full stack |
| [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) | Optional — public HTTPS to your machine |
| [smee-client](https://github.com/probot/smee-client) | Optional — GitHub webhooks in local dev |

---

### 2. Environment variables

Copy the template and fill secrets locally (never commit `.env`):

```bash
cp .env.example .env
```

#### Required to run bot + worker

| Variable | Secret? | Where to get it |
|----------|---------|-----------------|
| `DISCORD_TOKEN` | Yes | [Discord Developer Portal](https://discord.com/developers/applications) → your app → Bot → token |
| `DISCORD_APPLICATION_ID` | No | Same app → General Information → Application ID |
| `DATABASE_URL` | Yes | Supabase → **Project Settings** → **Database** → URI (use **Transaction pooler**, port `6543`, for bot/worker) |

#### Strongly recommended

| Variable | Secret? | Purpose |
|----------|---------|---------|
| `DISCORD_DEV_GUILD_ID` | No | Deploy slash commands to one test server (fast updates) |
| `REDIS_URL` | Sometimes | `redis://127.0.0.1:6379` local, or `redis://redis:6379` in Docker Compose |

#### GitHub webhooks

| Variable | Secret? | Purpose |
|----------|---------|---------|
| `GITHUB_WEBHOOK_SECRET` | Yes | **You choose** this string; same value in GitHub webhook “Secret” and here |
| `WEBHOOK_PORT` | No | Port worker HTTP server listens on (default `3000`) |

Generate a webhook secret:

```bash
openssl rand -hex 32
```

#### Optional

| Variable | Purpose |
|----------|---------|
| `DIRECT_URL` | Supabase **direct** DB URI (port `5432`) — useful for `prisma migrate` when `DATABASE_URL` uses the pooler |
| `LLM_API_KEY` | Real LLM calls (no-op when unset) |
| `LLM_MODEL`, `LLM_DAILY_TOKEN_BUDGET` | LLM tuning |

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are **not used** by the app after the Prisma migration; only `DATABASE_URL` is required for Postgres.

#### Cursor Cloud / CI secrets

Register the same names as **runtime secrets** (tokens, `DATABASE_URL`, `GITHUB_WEBHOOK_SECRET`) or **environment variables** (IDs, ports). Match [`.env.example`](.env.example).

---

### 3. Database (Supabase + Prisma)

Postgres is hosted on **Supabase**; the app uses **Prisma** with `DATABASE_URL`.

```bash
pnpm install
pnpm run db:migrate    # apply prisma/migrations to your database
pnpm run build
```

- Schema: [`prisma/schema.prisma`](prisma/schema.prisma)
- If the DB already has tables from an older `supabase/migrations/001_initial.sql`, either use a fresh database or mark migrations applied: `pnpm exec prisma migrate resolve --applied 20250602140000_init`

Inspect data: `pnpm run db:studio`

---

### 4. Run locally (bot + worker + Redis)

**Terminal A — Redis** (if not using Docker):

```bash
docker run --rm -p 6379:6379 redis:7-alpine
```

**Terminal B — worker** (webhooks + queues):

```bash
export REDIS_URL=redis://127.0.0.1:6379
# plus DISCORD_*, DATABASE_URL from .env
pnpm run build
pnpm run start:worker
```

**Terminal C — bot**:

```bash
pnpm run start:bot
```

Verify toolchain:

```bash
pnpm run build && pnpm test && pnpm run lint
```

---

### 5. Docker Compose (recommended stack)

Compose runs **bot**, **worker**, and **redis**; it sets `REDIS_URL=redis://redis:6379` for you.

```bash
cp .env.example .env   # fill DATABASE_URL, DISCORD_*, etc.
docker compose build
docker compose up -d
docker compose logs -f worker
docker compose logs -f bot
```

| Service | Command | Host port |
|---------|---------|-----------|
| `redis` | Redis 7 | `127.0.0.1:6379` |
| `bot` | `node dist/index.js` | — |
| `worker` | `node dist/worker.js` | webhook on container `:3000` |

Rebuild after code changes:

```bash
docker compose build bot worker && docker compose up -d
```

---

### 6. GitHub webhooks — development with [smee.io](https://smee.io)

GitHub must send HTTPS POSTs to your app. On a laptop, use **smee.io** as a public forwarder to `localhost`.

#### Step A — Create a smee channel

1. Open [https://smee.io](https://smee.io) and click **Start a new channel**.
2. Copy your channel URL (example shape: `https://smee.io/xxxxxxxx`).

#### Step B — Configure GitHub

Repo: **[dread-repo/dreadREPO](https://github.com/dread-repo/dreadREPO)** (hardcoded watcher).

1. **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: your smee URL (e.g. `https://smee.io/xxxxxxxx`)
3. **Content type**: `application/json`
4. **Secret**: same value as `GITHUB_WEBHOOK_SECRET` in `.env`
5. **Events**: choose events you enabled per guild via `/github setup` (push, PR, releases, etc.)
6. Save

#### Step C — Forward smee → local worker

With the **worker** running on port `3000`:

```bash
npx smee-client --url https://smee.io/YOUR_CHANNEL_ID --target http://127.0.0.1:3000/webhooks/github
```

Replace `YOUR_CHANNEL_ID` with your channel path. Leave this process running while testing.

Flow:

```text
GitHub → https://smee.io/… → smee-client → http://127.0.0.1:3000/webhooks/github → worker → Redis
```

#### Step D — Test

Trigger an event on `dreadREPO` (e.g. push to default branch). Check worker logs and Redis/BullMQ jobs.

> **Note:** Do not commit personal smee URLs to the repo; each developer uses their own channel.

---

### 7. GitHub webhooks — production URL with Cloudflare Tunnel

Use this when GitHub should hit a **stable HTTPS hostname** (VPS, homelab, or cloud VM) without opening port 3000 on the public internet.

The Node **worker** still runs on the host (or in Docker). **cloudflared** only exposes it securely.

#### Option A — Quick tunnel (tryout)

```bash
# worker listening on WEBHOOK_PORT (default 3000)
cloudflared tunnel --url http://127.0.0.1:3000
```

Cloudflared prints a `https://….trycloudflare.com` URL. GitHub webhook payload URL:

```text
https://<random>.trycloudflare.com/webhooks/github
```

URLs change each run — fine for experiments, not production.

#### Option B — Named tunnel + your domain (production)

1. [Create a Cloudflare account](https://dash.cloudflare.com) and add your domain.
2. Install `cloudflared` on the same machine that runs the worker.
3. Authenticate and create a tunnel:

```bash
cloudflared tunnel login
cloudflared tunnel create dread-bot-webhooks
```

4. Configure routing (example `~/.cloudflared/config.yml`):

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /home/you/.cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: webhooks.yourdomain.com
    service: http://127.0.0.1:3000
  - service: http_status:404
```

5. DNS: add a CNAME for `webhooks.yourdomain.com` to `<TUNNEL_UUID>.cfargotunnel.com` (or use `cloudflared tunnel route dns`).

6. Run the tunnel:

```bash
cloudflared tunnel run dread-bot-webhooks
```

7. GitHub webhook **Payload URL**:

```text
https://webhooks.yourdomain.com/webhooks/github
```

8. Set `GITHUB_WEBHOOK_SECRET` in production secrets (same as GitHub “Secret”).

#### Docker Compose + cloudflared

Publish worker port to the host, then point cloudflared at the host:

```yaml
# docker-compose.override.yml (local file, not committed)
services:
  worker:
    ports:
      - '127.0.0.1:3000:3000'
```

Run `docker compose up -d`, then `cloudflared tunnel run …` → `http://127.0.0.1:3000`.

#### Cloudflare “Worker” vs this worker

| | This repo `worker` | Cloudflare Worker |
|--|-------------------|-------------------|
| Runtime | Node.js + BullMQ + Prisma | Edge V8 isolate |
| Use here | **Yes** — current code | **No** — would need a separate webhook receiver design |

You may still use **Cloudflare** for DNS, TLS, and **Tunnel** in front of the Node worker.

---

### 8. Discord application checklist

1. [Developer Portal](https://discord.com/developers/applications) → create/select app.
2. **Bot** → enable intents if needed (Message Content for Dread replies).
3. Copy **token** → `DISCORD_TOKEN`, **Application ID** → `DISCORD_APPLICATION_ID`.
4. **OAuth2 → URL Generator** → `bot` + `applications.commands`; invite bot to test guild.
5. Set `DISCORD_DEV_GUILD_ID` to that guild’s ID (Developer Mode → copy ID).
6. Start bot once — slash commands register to the dev guild.

Config commands (need admin/bot-admin per spec): `/thunderstore setup`, `/github setup`.

---

### 9. Troubleshooting

| Symptom | Check |
|---------|--------|
| `Invalid environment` on start | All required env vars set (`DISCORD_*`, `DATABASE_URL`) |
| Bot online but no slash commands | `DISCORD_APPLICATION_ID`, `DISCORD_DEV_GUILD_ID`, bot invited with `applications.commands` |
| Webhook 401 | `GITHUB_WEBHOOK_SECRET` matches GitHub webhook secret |
| Webhook 404 | URL must end with `/webhooks/github`; repo must be `dread-repo/dreadREPO` |
| Jobs not running | `REDIS_URL` reachable; worker process running |
| Prisma errors | Run `pnpm run db:migrate`; pooler URL for runtime, `DIRECT_URL` for migrate if needed |

More detail: [docs/development.md](docs/development.md).

---

## Quick start (toolchain only)

```bash
cp .env.example .env
pnpm install
pnpm run build
pnpm test
pnpm run lint
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/development.md](docs/development.md) | pnpm security, Docker details, troubleshooting |
| [AGENTS.md](AGENTS.md) | Build, verify, version control, Spec Kit |
| [CONTEXT.md](CONTEXT.md) | Domain glossary |
| [docs/agents/README.md](docs/agents/README.md) | Agent orchestration hub |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Backlog and execution order |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Human contributors |

## Spec-driven development (Spec Kit)

Initialized with [GitHub Spec Kit](https://github.com/github/spec-kit). In Cursor, use skills such as:

- `/speckit-constitution` — project principles
- `/speckit-specify` — feature specification
- `/speckit-plan` — implementation plan
- `/speckit-tasks` — actionable tasks
- `/speckit-implement` — execute tasks

Artifacts live under `specs/` and `.specify/`. See [AGENTS.md](AGENTS.md).

## Agent skills

Project-local skills: [`.agents/skills/`](.agents/skills/). Agent docs: [docs/agents/](docs/agents/).
