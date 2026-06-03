# Contract: Thunderstore HTTP client

**Module**: `src/lib/watchers/thunderstore-client.ts`

## Endpoint

```http
GET https://thunderstore.io/api/experimental/package/{namespace}/{name}/
```

R.E.P.O. packages (including core **elytraking/Dread**) return 404 on legacy v1; use experimental.

## Response (subset)

| Field | Use |
|-------|-----|
| `latest.version_number` | Version string for dedupe + display |
| `latest.changelog` | Announcement body when present |
| `latest.description` | Body fallback when changelog absent |
| `latest.date_created` | Announcement timestamp |
| `latest.download_url` | Optional metadata |

Validate with zod in `thunderstore-types.ts`.

## Errors

| Condition | Behavior |
|-----------|----------|
| 404 | Log; skip package (removed or typo) |
| 5xx / timeout | Retry with backoff; do not announce |
| Rate limit (429) | Backoff; extend poll cycle |

## URL builders

| Link | Pattern |
|------|---------|
| Thunderstore version | `https://thunderstore.io/c/{community}/p/{namespace}/{name}/v/{version}/` (R.E.P.O. community: `repo`) |
| GitHub release (optional) | `https://github.com/{owner}/{repo}/releases/tag/{version}` when `githubRepo` set |
