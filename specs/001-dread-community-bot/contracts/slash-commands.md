# Contract: Slash commands

All commands are **guild** scoped unless noted. Responses use **Container v2** for public replies; errors use **ephemeral** unless noted.

## Config & watchers

| Command | Permission | Options | Behavior |
|---------|------------|---------|----------|
| `/thunderstore setup` | `config` | `channel`, `role` (ping) | Upsert `guild_thunderstore_config` |
| `/github setup` | `config` | `channel`, `events` (multi: push, pr, ci, release, issues, deployment) | Upsert `guild_github_config` |
| `/forum register` | `config` + official guild | `forum_channel` | Upsert `guild_forum_config` |
| `/config set-admin-role` | `config` | `role` | Set `bot_admin_role_id` |
| `/config grant-admin` | `setBotAdmin` (Discord Administrator) | `user` | Insert `guild_bot_admins` |
| `/config dread-channels` | `config` | `channels[]` | Set allowlist for in-character replies |

## Global packages (official guild only)

| Command | Permission | Options | Behavior |
|---------|------------|---------|----------|
| `/plugin register` | `globalPluginRegister` | `namespace`, `name`, `is_core?` | Insert `global_packages` |

## Announcements

| Command | Permission | Options | Behavior |
|---------|------------|---------|----------|
| `/announce` | `config` | `content` or modal | Start draft → LLM review → ephemeral preview |
| — | — | buttons: Confirm, Edit, Post anyway | Confirm posts Container to selected channel |

## Support forum

| Command | Permission | Options | Behavior |
|---------|------------|---------|----------|
| `/support repo` | any in thread | `repo` | Manual repo override when auto-routing fails |

## Utilities (no permission gate)

| Command | Behavior |
|---------|----------|
| `/features` | Render `config/features.json` |
| `/readme` | Render `config/readme.json` |
| `/download` | Render `config/downloads.json` with link buttons |

## Moderation (guild-local `moderate` only)

| Command | Options |
|---------|---------|
| `/purge` | `count`, `user?`, `channel?` |
| `/ban` | `user`, `reason?`, `delete_days?` |
| `/kick` | `user`, `reason?` |
| `/timeout` | `user`, `duration`, `reason?` |
| `/role add` | `user`, `role` |
| `/role remove` | `user`, `role` |
| `/userinfo` | `user` |

## Component interactions (non-slash)

| Custom ID prefix | Story | Action |
|----------------|-------|--------|
| `announce:` | US4 | confirm, edit, post_anyway |
| `forum:dup:` | US5 | close_duplicate, not_duplicate |
