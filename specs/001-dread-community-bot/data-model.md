# Data Model: Dread Community Discord Bot

**Feature**: `001-dread-community-bot`  
**Store**: Supabase-hosted Postgres, schema and access via **Prisma ORM** (`prisma/schema.prisma`) — see [PRD.md](./PRD.md) and [docs/adr/0002-prisma-on-supabase-postgres.md](../../../docs/adr/0002-prisma-on-supabase-postgres.md). Bundled JSON for static content remains in `config/`.

## Entity relationship overview

```text
guild_config (1) ──< guild_thunderstore_config (0..1)
              ├──< guild_github_config (0..1)
              ├──< guild_forum_config (0..1, official guild only)
              └──< guild_bot_admins (0..n)

global_packages (n) ── watched by Thunderstore watcher

watcher_dedupe (n) ── idempotent announce keys

forum_attempts (n) ── per forum thread

announcement_drafts (n) ── ephemeral sessions (TTL)
```

## Tables

### `guild_config`

| Column | Type | Notes |
|--------|------|-------|
| `guild_id` | `text` PK | Discord snowflake |
| `bot_admin_role_id` | `text` nullable | Role granted bot-admin |
| `dread_reply_channel_ids` | `text[]` | Allowlist for in-character replies |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### `guild_thunderstore_config`

| Column | Type | Notes |
|--------|------|-------|
| `guild_id` | `text` PK FK | |
| `channel_id` | `text` | Announcement channel |
| `ping_role_id` | `text` | Mentioned on each post |
| `updated_at` | `timestamptz` | |

### `guild_github_config`

| Column | Type | Notes |
|--------|------|-------|
| `guild_id` | `text` PK FK | |
| `channel_id` | `text` | Single channel all events |
| `events` | `jsonb` | `{ push, pull_request, ci, release, issues, deployment }` booleans |
| `updated_at` | `timestamptz` | |

### `guild_forum_config`

| Column | Type | Notes |
|--------|------|-------|
| `guild_id` | `text` PK FK | Must equal official guild |
| `forum_channel_id` | `text` | Forum channel |
| `updated_at` | `timestamptz` | |

### `guild_bot_admins`

| Column | Type | Notes |
|--------|------|-------|
| `guild_id` | `text` FK | |
| `user_id` | `text` | Discord user |
| PK | (`guild_id`, `user_id`) | |

### `global_packages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `namespace` | `text` | Thunderstore namespace |
| `name` | `text` | Package name |
| `is_core` | `boolean` | Core vs plugin label |
| `github_repo` | `text` nullable | `owner/repo` for release button |
| `registered_by` | `text` | User id |
| `created_at` | `timestamptz` | |

Unique: (`namespace`, `name`)

### `watcher_dedupe`

| Column | Type | Notes |
|--------|------|-------|
| `dedupe_key` | `text` PK | e.g. `ts:namespace-name@1.2.3`, `gh:delivery-id` |
| `announced_at` | `timestamptz` | |

### `forum_attempts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `thread_id` | `text` | Forum post thread |
| `guild_id` | `text` | |
| `repo` | `text` | `owner/repo` |
| `query_summary` | `text` | Truncated question |
| `answer_summary` | `text` | Bot answer excerpt |
| `created_at` | `timestamptz` | |

Index: (`thread_id`, `created_at`)

### `announcement_drafts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `guild_id` | `text` | |
| `user_id` | `text` | |
| `content` | `text` | Draft body |
| `llm_feedback` | `jsonb` nullable | Warnings |
| `target_channel_id` | `text` nullable | After channel select |
| `expires_at` | `timestamptz` | Short TTL |

## Bundled JSON (repo, not DB)

| File | Purpose |
|------|---------|
| `config/official-packages.json` | Core + official plugins (manifest) |
| `config/faq.json` | Forum FAQ entries |
| `config/repo-tag-map.json` | Forum tag → GitHub repo |
| `config/features.json` | `/features` output |
| `config/readme.json` | `/readme` sections |
| `config/downloads.json` | `/download` URLs |
| `config/dread-persona.md` | In-character system prompt |

## Validation rules

- Official guild-only commands enforce `guild_id === '1510452344024727775'`.
- GitHub events JSON must have at least one `true` when registering GitHub channel.
- Thunderstore config requires both `channel_id` and `ping_role_id`.
- Dedupe insert uses `ON CONFLICT DO NOTHING` before announce.

## State transitions

### Announcement draft

`draft` → `previewed` → `confirmed` → (message posted, row deleted)  
`draft` → `expired` (TTL)

### Forum duplicate staff action

`pending_review` → `closed_duplicate` | `not_duplicate` (button interaction)
