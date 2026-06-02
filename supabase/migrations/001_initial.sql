-- Dread Community Discord Bot — initial schema (001-dread-community-bot)

create table if not exists guild_config (
  guild_id text primary key,
  bot_admin_role_id text,
  dread_reply_channel_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists guild_thunderstore_config (
  guild_id text primary key references guild_config (guild_id) on delete cascade,
  channel_id text not null,
  ping_role_id text not null,
  updated_at timestamptz not null default now()
);

create table if not exists guild_github_config (
  guild_id text primary key references guild_config (guild_id) on delete cascade,
  channel_id text not null,
  events jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists guild_forum_config (
  guild_id text primary key references guild_config (guild_id) on delete cascade,
  forum_channel_id text not null,
  updated_at timestamptz not null default now()
);

create table if not exists guild_bot_admins (
  guild_id text not null references guild_config (guild_id) on delete cascade,
  user_id text not null,
  primary key (guild_id, user_id)
);

create table if not exists global_packages (
  id uuid primary key default gen_random_uuid(),
  namespace text not null,
  name text not null,
  is_core boolean not null default false,
  github_repo text,
  registered_by text not null,
  created_at timestamptz not null default now(),
  unique (namespace, name)
);

create table if not exists watcher_dedupe (
  dedupe_key text primary key,
  announced_at timestamptz not null default now()
);

create table if not exists forum_attempts (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  guild_id text not null,
  repo text not null,
  query_summary text not null,
  answer_summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists forum_attempts_thread_id_idx on forum_attempts (thread_id, created_at);

create table if not exists announcement_drafts (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  user_id text not null,
  content text not null,
  llm_feedback jsonb,
  target_channel_id text,
  expires_at timestamptz not null
);

create index if not exists announcement_drafts_expires_at_idx on announcement_drafts (expires_at);
