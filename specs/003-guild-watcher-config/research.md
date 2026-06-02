# Research: Guild Watcher Configuration (003)

**Feature**: `003-guild-watcher-config`  
**Date**: 2026-06-02

## R1: Command registration

**Decision**: Register `/thunderstore` and `/github` as **top-level** commands with subcommand `setup` (matches epic contract table: `/thunderstore setup`, `/github setup`).

**Rationale**: Discord.js `SlashCommandBuilder` supports subcommands; matches existing epic documentation and QS1 quickstart.

**Alternatives considered**:
- Single `/watcher setup` with type option: rejected — breaks slash-commands contract.

## R2: GitHub event toggles storage

**Decision**: Persist `events` as `jsonb` on `guild_github_config` with fixed keys: `push`, `pull_request`, `ci`, `release`, `issues`, `deployment` (booleans). Slash options use short names `pr` → maps to `pull_request`.

**Rationale**: Matches [001 data-model](../001-dread-community-bot/data-model.md); watchers 005 filter on these keys.

**Validation**: At least one event `true` on upsert (FR from epic data-model validation rules).

## R3: Guild parent row

**Decision**: `upsertThunderstore` / `upsertGithub` call `guildConfig.upsert` first (create parent `guild_id` if missing) then upsert child table.

**Rationale**: FK from child to `guild_config`; partial config (Thunderstore-only) is valid per spec edge cases.

## R4: Permission checks

**Decision**: Use `PermissionResolver.can('config', ctx)` with member permission bitfield from interaction; deny → ephemeral error string (no public message).

**Rationale**: FR-003; spec 002 resolver already implements config action.

## R5: Success UX

**Decision**: Ephemeral confirmation listing saved channel (and role/events summary); errors ephemeral only.

**Rationale**: FR-004; staff-only setup, no channel spam.

## R6: Command file layout

**Decision**: Handlers in `src/bot/handlers/thunderstore-setup.ts` and `github-setup.ts`; register in `interaction-create.ts` via `InteractionRouter`.

**Rationale**: Matches 002 `platform-smoke` pattern; keeps commands discoverable.

## R7: Testing

**Decision**: Unit test store upserts against Prisma mock (same pattern as 002 dedupe tests); handler tests mock `can()` and assert `reply` ephemeral on deny.

**Rationale**: Tier 0; QS1 is Tier 1 manual.
