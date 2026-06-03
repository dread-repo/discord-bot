# discord-bot

Bounded context for **discord-bot**: Discord application that serves the dread-repo community (commands, notifications, moderation helpers, and related automation).

This file is a **domain glossary** plus a short **file map** for onboarding. Details live in `docs/adr/` and code.

**Related:** [docs/agents/domain.md](docs/agents/domain.md)

## Language

### Core terms

**Guild**:
A Discord server instance the bot is installed on.
_Avoid_: "server" in user-facing bot copy when Discord terminology should stay consistent.

**Interaction**:
Slash commands, buttons, modals, and context menus delivered over Discord's interaction API.
_Avoid_: Treating message content events as the only input surface when the feature is interaction-based.

**Core Thunderstore package**:
`elytraking/Dread` on community `repo` — [Thunderstore](https://thunderstore.io/c/repo/p/elytraking/Dread/), GitHub [dread-repo/dreadREPO](https://github.com/dread-repo/dreadREPO). Listed in `config/official-packages.json` with `isCore: true`.

**Command handler**:
Code path that validates an interaction, runs business logic, and replies or defers.
_Avoid_: "endpoint" unless discussing HTTP webhooks explicitly.

Add entries as the codebase grows. Do not invent terms here without a corresponding concept in code or issues.

## File map (high level)

| Area | Path | Notes |
|------|------|-------|
| Source | `src/` | Application entry and handlers |
| Tests | `src/**/*.test.ts` | Unit and integration tests (Vitest) |
| Specs | `specs/` | Spec Kit feature folders (`NNN-name`) |
| Agent hub | `docs/agents/README.md` | Start here for agents |
