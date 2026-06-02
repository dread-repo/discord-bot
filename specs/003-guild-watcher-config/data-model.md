# Data Model: Guild Watcher Configuration (003)

**Canonical schema**: [001 data-model](../001-dread-community-bot/data-model.md)  
**ORM**: Prisma models already migrated in 002

## Entities in scope

### `guild_config` (parent)

| Operation | When |
|-----------|------|
| `upsert` with `guildId` only | Before child config write if row missing |

### `guild_thunderstore_config`

| Field | Validation |
|-------|------------|
| `channel_id` | Required snowflake string |
| `ping_role_id` | Required snowflake string |

**Store**: `GuildConfigStore.upsertThunderstore(guildId, { channelId, pingRoleId })`  
**Read**: `getThunderstore(guildId)` → row or null

### `guild_github_config`

| Field | Validation |
|-------|------------|
| `channel_id` | Required snowflake string |
| `events` | JSON object; at least one boolean `true` |

**Default events object** (all false until staff enables):

```json
{
  "push": false,
  "pull_request": false,
  "ci": false,
  "release": false,
  "issues": false,
  "deployment": false
}
```

**Store**: `GuildConfigStore.upsertGithub(guildId, { channelId, events })`  
**Read**: `getGithub(guildId)` → row or null

## Out of scope (schema exists, not written by 003)

- `guild_forum_config`, `guild_bot_admins` field updates (other specs)
- Watcher dedupe, global packages

## State transitions

Setup is **upsert-only**: first run creates; re-run updates `updated_at` and changed fields. No delete command in 003.
