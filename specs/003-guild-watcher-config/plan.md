# Implementation Plan: Guild Watcher Configuration

**Branch**: `003-guild-watcher-config` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: [spec.md](./spec.md) · Platform [002](../002-core-platform/spec.md) · Epic [slash-commands](../001-dread-community-bot/contracts/slash-commands.md) · [data-model](../001-dread-community-bot/data-model.md)

## Summary

Add `/thunderstore setup` and `/github setup` slash commands that upsert per-guild watcher configuration in Postgres via extended `GuildConfigStore`, gated by `PermissionResolver` `config` action, with ephemeral success/error replies. Unblocks specs 004 and 005.

## Technical Context

**Language/Version**: TypeScript 5.8+ on Node.js 22+

**Primary Dependencies**: discord.js 14.19+ (slash commands, channel/role options), zod 3.x, Prisma 6 via existing `GuildConfigStore`

**Storage**: `guild_config` (parent row), `guild_thunderstore_config`, `guild_github_config` — schema exists from 002 init migration

**Testing**: Vitest — store upsert tests, handler tests with mocked interaction + permission resolver

**Target Platform**: Same bot process as 002 (`src/index.ts`)

**Project Type**: Feature module on core platform

**Performance Goals**: Interaction ack &lt; 3s; DB upsert single transaction per command

**Constraints**: No announcement posts; no worker changes; must match epic slash contract option names

**Scale/Scope**: Two commands + store extensions + registration in `register-commands.ts`

## Constitution Check

| Gate | Status |
|------|--------|
| Depends on 002 platform | PASS — uses router, resolver, stores |
| Tier 0 verify | PASS — unit tests, no live Discord in CI |
| Minimal scope | PASS — no watcher poll/webhook logic |
| Epic slash contract | PASS — documented in [contracts/](./contracts/) |

## Project Structure

```text
src/
├── bot/
│   ├── register-commands.ts      # add thunderstore + github commands
│   └── handlers/
│       ├── thunderstore-setup.ts
│       └── github-setup.ts
├── lib/
│   └── config/
│       ├── guild-config-store.ts  # extend: upsertThunderstore, upsertGithub, getters
│       └── github-events.ts         # zod schema + defaults
```

**Documentation (this feature)**:

```text
specs/003-guild-watcher-config/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── tasks.md
└── checklists/
```

## Phase mapping

| Deliverable | Unblocks |
|-------------|----------|
| Store upsert/get for Thunderstore + GitHub | 004, 005 |
| `/thunderstore setup`, `/github setup` | 004, 005 |
| Permission-gated ephemeral UX | QS1 |

## Complexity Tracking

None — thin feature on existing platform.
