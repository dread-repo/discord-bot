# Contract: `/thunderstore setup`

**Handler**: `src/bot/handlers/thunderstore-setup.ts`  
**Permission**: `PermissionResolver` action `config`

## Slash command definition

| Field | Value |
|-------|-------|
| Name | `thunderstore` |
| Subcommand | `setup` |
| Description | Register Thunderstore announcement channel and ping role |

### Options

| Option | Type | Required |
|--------|------|----------|
| `channel` | Channel | yes |
| `role` | Role | yes |

## Behavior

1. Resolve permission; if denied → `reply({ ephemeral: true, content: '…' })`.
2. Validate guild context present.
3. `GuildConfigStore.upsertThunderstore(guildId, channelId, pingRoleId)`.
4. Ephemeral success: confirm channel and role mentions.

## Errors (ephemeral)

- Missing guild context
- Permission denied
- DB failure → generic retry message (log server-side)
