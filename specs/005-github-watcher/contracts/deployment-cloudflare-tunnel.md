# Contract: Production deployment — Cloudflare Tunnel

**Target host**: Arch Linux (or any Linux) running **Docker Compose** (`bot`, `worker`, `redis`)  
**Public ingress**: **Cloudflare Tunnel** (`cloudflared`) — TLS terminates at Cloudflare; no inbound firewall ports for the webhook.

## Architecture

```text
GitHub ──HTTPS──► hooks.<your-domain> (Cloudflare edge)
                        │
                        ▼
                   cloudflared (on host)
                        │
                        ▼
              http://127.0.0.1:61952  (worker container)
                        │
                        ▼
              POST /webhooks/github → BullMQ → Discord REST
```

Bot gateway does **not** receive GitHub traffic. Postgres remains **Supabase** (not in Compose).

## DNS

| Record | Value | Notes |
|--------|-------|-------|
| `hooks` (or chosen label) | CNAME → `<tunnel-id>.cfargotunnel.com` | Created by Cloudflare dashboard when using named tunnel, **or** route via Zero Trust → Tunnels |

Use a **dedicated subdomain** (e.g. `hooks.example.com`), not the apex site.

## Docker Compose (worker)

Worker HTTP must listen inside the container on `WEBHOOK_PORT` (default `61952`) and be published **only on the host loopback**:

```yaml
worker:
  ports:
    - '127.0.0.1:61952:61952'
```

`cloudflared` on the **host** connects to `http://127.0.0.1:61952`. Do not bind `0.0.0.0:61952` on the host in production.

## cloudflared (host)

Install on Arch (example):

```bash
# AUR: cloudflared-bin, or official package / binary from Cloudflare
sudo pacman -S cloudflared   # if packaged; otherwise use Cloudflare install docs
```

### Named tunnel (recommended)

1. Cloudflare dashboard → **Zero Trust** → **Networks** → **Tunnels** → Create tunnel.
2. Install connector on the Arch host (`cloudflared service install <token>`).
3. **Public hostname**:
   - Subdomain: `hooks`
   - Domain: your zone
   - Service: `http://localhost:61952`
4. Save; note the public URL: `https://hooks.<your-domain>`.

### Config file alternative (`config.yml`)

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /etc/cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: hooks.example.com
    service: http://127.0.0.1:61952
  - service: http_status:404
```

Run as a **systemd user/service** so it starts with the host:

```ini
# /etc/systemd/system/cloudflared.service (example — adjust paths)
[Unit]
Description=Cloudflare Tunnel
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Start order: Docker Compose (bot/worker/redis) **before** or with `cloudflared`; webhook fails if worker is down.

## GitHub webhook

| Field | Value |
|-------|-------|
| Payload URL | `https://hooks.<your-domain>/webhooks/github` |
| Content type | `application/json` |
| Secret | Same as `GITHUB_WEBHOOK_SECRET` in `.env` |
| Repository | Webhook on **`dread-repo/dreadREPO`** only |
| Events | Match guild toggles from `/github setup` |

Verify in GitHub → Webhook → **Recent deliveries** (green 200). `401` → secret mismatch; `502` → tunnel or worker down.

## Environment (`.env` on host)

| Variable | Required | Notes |
|----------|----------|-------|
| `GITHUB_WEBHOOK_SECRET` | **Yes** (prod) | Must match GitHub webhook |
| `WEBHOOK_PORT` | No | Default `61952`; must match Compose port mapping |
| `DISCORD_TOKEN` | Yes | Worker posts via REST |
| `DATABASE_URL` / `REDIS_URL` | Yes | Same as bot |

Optional documentation-only:

| Variable | Purpose |
|----------|---------|
| `WEBHOOK_PUBLIC_URL` | e.g. `https://hooks.example.com` — for logs/health messages only (not required by code in v1) |

## Security

- Do **not** expose Redis, bot, or worker on `0.0.0.0`.
- Firewall (e.g. `ufw`): allow SSH (or Tailscale); **no** public port 61952.
- `.env` mode `600`; never commit secrets.
- Cloudflare Tunnel is **outbound-only** from host to Cloudflare — no open webhook port on the router.

## Health check

When `GET /health` is implemented ([github-http.md](./github-http.md)):

```bash
curl -sS "https://hooks.<your-domain>/health"
```

Use for tunnel/route smoke tests before configuring GitHub.

## Local development (not tunnel)

Use `curl` to `http://127.0.0.1:61952` or a dev tunnel (e.g. `cloudflared tunnel --url http://localhost:61952`) — see [quickstart.md](../quickstart.md).

## Alternatives (out of scope for v1 default)

| Approach | When |
|----------|------|
| Caddy/nginx on host :443 → `127.0.0.1:61952` | VPS with public IP and orange-cloud DNS |
| Cloudflare Worker as webhook receiver | Different architecture; not spec 005 |

**Decision**: **Cloudflare Tunnel + Docker on Arch** is the documented production path for this project.
