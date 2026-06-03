# Data Model: Thunderstore Watcher (004)

**Canonical schema**: [001 data-model](../001-dread-community-bot/data-model.md) · **ORM**: Prisma (002 migration)

## Read paths (004)

| Entity | Store / module | Usage |
|--------|----------------|-------|
| `guild_thunderstore_config` | `GuildConfigStore.getThunderstore` + new `listThunderstoreGuilds()` | Announce fan-out |
| `global_packages` | `GlobalPackageRegistry.listEffective` | Watch list |
| `watcher_dedupe` | `WatcherDedupeStore.tryInsert` | Per version key |

## Write paths (004)

| Entity | Operation | Trigger |
|--------|-----------|---------|
| `global_packages` | `INSERT` | `/plugin register` (official guild) |
| `watcher_dedupe` | `INSERT` | First announce for `ts:{ns}/{name}@{version}` |

## Dedupe key

```text
ts:{namespace}/{name}@{version}
```

Example: `ts:BepInEx/BepInExPack@5.4.2100`

## Job payloads (in-memory)

See [contracts/job-payloads.md](./contracts/job-payloads.md) — aligns with [001 job-queues](../001-dread-community-bot/contracts/job-queues.md).

## Out of scope tables

- `guild_github_config`, `guild_forum_config`, `announcement_draft` — other specs

## Validation

- Register: reject duplicate `(namespace, name)` with user-facing ephemeral error.
- Announce: skip guilds where bot lacks `Send Messages` / `View Channel` (log warning, continue other guilds).
