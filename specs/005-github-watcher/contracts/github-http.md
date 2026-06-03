# Contract: GitHub webhook HTTP (005)

**Module**: `src/worker/http.ts`  
**Env**: `WEBHOOK_PORT` (default `61952`), `GITHUB_WEBHOOK_SECRET`

Extends epic [github-webhook](../../001-dread-community-bot/contracts/github-webhook.md).

**Production URL**: `https://hooks.<domain>/webhooks/github` via [Cloudflare Tunnel](./deployment-cloudflare-tunnel.md) → `127.0.0.1:WEBHOOK_PORT`.

## Route

```http
POST /webhooks/github
```

## Headers (required)

| Header | Use |
|--------|-----|
| `X-GitHub-Event` | Event type string |
| `X-GitHub-Delivery` | Dedupe id |
| `X-Hub-Signature-256` | HMAC verify when secret set |
| `Content-Type` | `application/json` |

## Responses

| Status | When |
|--------|------|
| `200` | Accepted (enqueued or ignored after valid auth) |
| `401` | Bad/missing signature when `GITHUB_WEBHOOK_SECRET` set |
| `404` | Wrong `repository.full_name` |
| `405` | Non-POST |
| `413` | Body too large (cap e.g. 1 MiB) |

## Body handling

- Read raw body as string/Buffer for HMAC (before JSON parse).
- Max body size limit to prevent abuse.

## Health (optional)

```http
GET /health
```

Returns `200` `{ "ok": true }` for load balancers.
