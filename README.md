# discord-bot

Discord bot for the [dread-repo](https://github.com/dread-repo) org. Agent and spec tooling follow patterns from [dreadREPO](https://github.com/dread-repo/dreadREPO).

## Quick start

1. Copy env template when it exists: `cp .env.example .env` (fill Discord token and app IDs).
2. Install dependencies when `package.json` lands: `npm install`.
3. Run dev server when scripts exist: `npm run dev`.

## Documentation

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](AGENTS.md) | Build, verify, version control, Spec Kit |
| [CONTEXT.md](CONTEXT.md) | Domain glossary |
| [docs/agents/README.md](docs/agents/README.md) | Agent orchestration hub |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Backlog and execution order |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Human contributors |

## Spec-driven development (Spec Kit)

Initialized with [GitHub Spec Kit](https://github.com/github/spec-kit). In Cursor, use skills such as:

- `/speckit-constitution` — project principles
- `/speckit-specify` — feature specification
- `/speckit-plan` — implementation plan
- `/speckit-tasks` — actionable tasks
- `/speckit-implement` — execute tasks

Artifacts live under `specs/` and `.specify/`. See [AGENTS.md](AGENTS.md) for when Spec Kit vs plain issues applies.

## Engineering skills (Matt Pocock)

Project-local skills are under [`.agents/skills/`](.agents/skills/) (from [mattpocock/skills](https://github.com/mattpocock/skills)). Repo config for `triage`, `to-issues`, `tdd`, etc. is in [docs/agents/](docs/agents/). Run `/setup-matt-pocock-skills` once if those docs are missing or stale.
