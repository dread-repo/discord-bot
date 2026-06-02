# Contract: `/github setup`

**Handler**: `src/bot/handlers/github-setup.ts`  
**Permission**: `PermissionResolver` action `config`

## Slash command definition

| Field | Value |
|-------|-------|
| Name | `github` |
| Subcommand | `setup` |
| Description | Register GitHub announcement channel and enabled events |

### Options

| Option | Type | Required | Maps to `events` key |
|--------|------|----------|----------------------|
| `channel` | Channel | yes | — |
| `push` | Boolean | no | `push` |
| `pr` | Boolean | no | `pull_request` |
| `ci` | Boolean | no | `ci` |
| `release` | Boolean | no | `release` |
| `issues` | Boolean | no | `issues` |
| `deployment` | Boolean | no | `deployment` |

At least one event option must be `true` (or use defaults from prior config merged — v1: require at least one true on command invocation).

## Behavior

1. Permission check (ephemeral deny).
2. Build `events` object from boolean options.
3. Reject if no event enabled.
4. `GuildConfigStore.upsertGithub(guildId, channelId, events)`.
5. Ephemeral success listing channel and enabled event names.

## Errors (ephemeral)

- No events selected
- Permission denied
- DB failure
