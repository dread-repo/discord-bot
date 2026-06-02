# Quickstart: Guild Watcher Configuration (003)

Manual acceptance after [002 quickstart](../002-core-platform/quickstart.md) (platform running).

## Prerequisites

- Bot and worker running; migrations applied
- Test guild; bot invited with `applications.commands`
- `DISCORD_DEV_GUILD_ID` set; commands deployed
- Caller has Administrator (or bot-admin / Manage Guild per permission matrix)

## QS1: Watcher setup (US1)

1. Run `/thunderstore setup` with `#announce` and `@ModRole` (or equivalent).
2. Run `/github setup` with `#announce` and enable `push`, `ci`, `release`.
3. Restart bot — configs still apply (query Supabase Table Editor or Prisma Studio).
4. As a user without config permission, run `/thunderstore setup` — ephemeral error, no DB change.

**Pass**: Steps 1–3 succeed; step 4 denied.

## QS2: Partial config

1. Configure Thunderstore only (skip GitHub).
2. Confirm `guild_thunderstore_config` row exists; `guild_github_config` absent or unchanged.

**Pass**: Valid partial setup per spec edge case.

## Tier 0 (CI)

```bash
pnpm test -- guild-config
pnpm run lint
```

Tests cover store upsert and permission deny on handlers (no live Discord).
