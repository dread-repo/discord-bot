# Contract: GitHub webhook

**Endpoint**: `POST /webhooks/github` (worker HTTP server, port `WEBHOOK_PORT` default `61952`)

**Headers**:
- `X-Hub-Signature-256`: HMAC SHA-256 of body with `GITHUB_WEBHOOK_SECRET`
- `X-GitHub-Event`: event type
- `X-GitHub-Delivery`: unique delivery id (dedupe key)

**Repository filter**: Only process events where `repository.full_name === 'dread-repo/dreadREPO'`.

## Event mapping → internal type

| GitHub event | Action filter | Internal `event` |
|--------------|---------------|------------------|
| `push` | `ref === refs/heads/master` | `push` |
| `pull_request` | opened, closed, merged | `pull_request` |
| `workflow_run` | completed on default branch | `ci` |
| `release` | published | `release` |
| `issues` | opened, closed | `issues` |
| `deployment_status` | success/failure | `deployment` |

## Per-guild fan-out

1. Load all `guild_github_config` rows.
2. For each guild, if `events[event]` is true, enqueue announce job with `deliveryId` + payload slice.
3. `WatcherDedupeStore` checks `gh:{deliveryId}` before post.

## Response

- `200` on accepted (even if deduped later)
- `401` invalid signature
- `404` wrong repo (ignored)
