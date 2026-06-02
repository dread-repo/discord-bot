# discord-bot

Discord bot for the [dread-repo](https://github.com/dread-repo) org. Agent and spec tooling follow patterns from [dreadREPO](https://github.com/dread-repo/dreadREPO).

## Quick start

1. Copy env template when it exists: `cp .env.example .env` (fill Discord token and app IDs).
2. Install dependencies: `pnpm install` (requires Node 22+ and pnpm 11; see `pnpm-workspace.yaml` for supply-chain settings).
3. Verify: `pnpm run build`, `pnpm test`, `pnpm run lint`.
4. Run: `pnpm start` (after `pnpm run build`).

## Docker

Stack: **bot** + **worker** + **Redis** (see [specs/001-dread-community-bot/PRD.md](specs/001-dread-community-bot/PRD.md)).

```bash
cp .env.example .env   # optional until secrets are required
docker compose build
docker compose up -d
docker compose logs -f bot
```

| Service | Role |
|---------|------|
| `bot` | Discord gateway / interactions (`node dist/index.js`) |
| `worker` | Background jobs (`node dist/worker.js`) |
| `redis` | BullMQ backend (`REDIS_URL=redis://redis:6379`) |

Redis is bound to `127.0.0.1:6379` on the host for local debugging only.

## Toolchain

Node **22+**, **pnpm 11**, strict **TypeScript** / **ESLint** (including import-x), and hardened installs (`minimumReleaseAge` 7 days, no dependency scripts unless `allowBuilds` says otherwise). Details: [docs/development.md](docs/development.md).

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/development.md](docs/development.md) | Local setup, pnpm security, Docker |
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

Artifacts live under `specs/` and `.specify/`. Spec Kit skills (`/speckit-*`) live in [`.agents/skills/`](.agents/skills/) alongside other agent skills. See [AGENTS.md](AGENTS.md) for when Spec Kit vs plain issues applies.

## Agent skills

Project-local skills are under [`.agents/skills/`](.agents/skills/): Spec Kit (`speckit-*`) and [mattpocock/skills](https://github.com/mattpocock/skills). Repo config for `triage`, `to-issues`, `tdd`, etc. is in [docs/agents/](docs/agents/). Run `/setup-matt-pocock-skills` once if those docs are missing or stale.
