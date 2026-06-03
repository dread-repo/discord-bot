# Data Model: GitHub Watcher (005)

**Canonical schema**: [001 data-model](../001-dread-community-bot/data-model.md) · **ORM**: Prisma (002 migration)

## Read paths (005)

| Entity | Store / module | Usage |
|--------|----------------|-------|
| `guild_github_config` | `GuildConfigStore.getGithub` + `listGithubGuilds()` | Announce fan-out + per-event filter |
| `watcher_dedupe` | `WatcherDedupeStore.tryInsert` | Per delivery id |

## Write paths (005)

| Entity | Operation | Trigger |
|--------|-----------|---------|
| `watcher_dedupe` | `INSERT` | First successful announce for `gh:{deliveryId}` |

No new tables in 005.

## Dedupe key

```text
gh:{X-GitHub-Delivery}
```

Example: `gh:12345678-1234-1234-1234-123456789012`

## Guild `events` JSON shape

Matches [003](../003-guild-watcher-config/spec.md) / `githubEventsSchema`:

```json
{
  "push": true,
  "pull_request": false,
  "ci": true,
  "release": true,
  "issues": false,
  "deployment": false
}
```

## Job payload

See [contracts/job-payloads.md](./contracts/job-payloads.md). Internal `event` uses `ci` (not `workflow_run`).

## Out of scope tables

- `guild_thunderstore_config`, `global_packages` (read-only for release button URL optional)

## Validation

- Webhook: `401` without valid signature when secret configured.
- Announce: skip guilds with disabled event flag; log and continue on Discord permission errors.
