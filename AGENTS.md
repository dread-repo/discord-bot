# discord-bot — Agent Instructions

Human contributors: see [CONTRIBUTING.md](CONTRIBUTING.md).

Agent orchestration hub: [docs/agents/README.md](docs/agents/README.md).

**Rule precedence:** This file and linked `docs/agents/` docs override generic assistant defaults. If something conflicts or is unclear, ask the user before proceeding.

## Agent skills

### Issue tracker

GitHub Issues on `dread-repo/discord-bot`. See [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

Canonical roles mapped in [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/`. See [docs/agents/domain.md](docs/agents/domain.md).

## Implementing work (read this first)

### Spec Kit feature (active plan in `.specify/feature.json`)

When a plan is active, use the Spec Kit flow on branch **`NNN-kebab-name`** (must match the spec folder, e.g. `001-discord-slash-commands`):

1. **Specify / plan / tasks** under `specs/NNN-.../` (or update existing artifacts)
2. **Implement** per `tasks.md`
3. **Analyze** (`/speckit-analyze`) when useful before implement
4. **Verify** Tier 0 (commands below when defined)
5. **Pull request** into `main` when the feature is complete

Use Cursor skills: `/speckit-constitution`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`.

### Other work (no active Spec Kit plan)

```
GitHub issue or ROADMAP row (ready-for-agent)
  -> CONTEXT.md + docs/agents/domain.md + relevant ADRs
  -> branch: fix/short-description or feat/short-description (kebab-case)
  -> implement (minimal diff)
  -> meaningful git commits on the branch
  -> Tier 0 verify when commands exist
  -> push + PR to main only when opening or updating the PR (or when the user asks)
  -> CHANGELOG [Unreleased] for user-facing changes
```

Full checklist: [docs/agents/orchestration.md](docs/agents/orchestration.md).

## Version control (agents)

| Rule | Detail |
|------|--------|
| **Commit** | After meaningful, coherent units. Messages: `feat:`, `fix:`, `docs:`, `ci:`, etc. |
| **Branch** | No direct commits to `main` for feature work. |
| **Spec Kit branch** | `NNN-kebab-name` when `.specify/feature.json` points at `specs/NNN-.../`. |
| **Otherwise** | `fix/...`, `feat/...` (kebab-case). |
| **Push** | Only when the user asks, or to open or update a pull request. |

Remote: `https://github.com/dread-repo/discord-bot`, default branch `main`.

## Build and test

Run from repository root:

```bash
pnpm install
pnpm run build
pnpm test
pnpm run lint
```

`pnpm-workspace.yaml` enforces `minimumReleaseAge` (7 days), `strictDepBuilds`, and `allowBuilds` (only explicit `true` entries may run install scripts).

Docker (bot + worker + Redis): `docker compose up` — see [docs/development.md](docs/development.md#docker).

## Verify

| Tier | When | Command / doc |
|------|------|----------------|
| 0 | Every PR (static) | `pnpm test` and `pnpm run lint` |
| 1+ | Optional integration | Add `docs/agents/verify-discord-bot.md` when live Discord testing is documented |

## Agent doc index

| Topic | Doc |
|-------|-----|
| Start here | [docs/agents/README.md](docs/agents/README.md) |
| Workflows | [docs/agents/orchestration.md](docs/agents/orchestration.md) |
| Issues | [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md) |
| Labels | [docs/agents/triage-labels.md](docs/agents/triage-labels.md) |
| Domain + ADRs | [docs/agents/domain.md](docs/agents/domain.md) |
| Glossary | [CONTEXT.md](CONTEXT.md) |
| Backlog | [docs/ROADMAP.md](docs/ROADMAP.md) |

## Paths agents must not edit

- `.env` and any file containing secrets or tokens
- `LICENSE` unless the user explicitly requests a license change

## Release (maintainers)

TBD until versioning is chosen. Maintain `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) when shipping tagged releases.

## Cursor Cloud specific instructions

### Toolchain

Node **22+** and **pnpm 11.5** via `corepack enable` (see `.node-version` and `packageManager` in `package.json`). Standard commands are in **Build and test** above and [docs/development.md](docs/development.md).

### Tier 0 verify (no services)

From repo root after `pnpm install`:

```bash
pnpm run build
pnpm run typecheck
pnpm test
pnpm run lint
```

Vitest is configured with `passWithNoTests: true` (no `*.test.ts` files yet).

### Lint (known state)

`pnpm run lint` currently reports ESLint errors on the stub entry files `src/index.ts` and `src/worker.ts` (empty keep-alive `await` and `void main()`). Fix those when bot/worker wiring lands; do not treat a green lint as a given until then.

### Running bot and worker locally

After `pnpm run build`:

```bash
export REDIS_URL=redis://127.0.0.1:6379   # optional until queue code exists
pnpm run start:bot    # or pnpm run start:worker
```

Stub entries use a top-level `await` on a never-settling promise. On Node 22 the runtime may exit with code **13** and an “unsettled top-level await” warning until real gateway/BullMQ wiring replaces that pattern. Tier 0 does not require long-running processes.

### Redis without Docker

Docker is **not** preinstalled on the default Cloud VM. For local BullMQ testing before Compose is available:

```bash
redis-server --daemonize yes --bind 127.0.0.1 --port 6379
redis-cli ping   # expect PONG
```

Production-shaped stack: install Docker, then `docker compose build` and `docker compose up -d` per [docs/development.md#docker](docs/development.md#docker).

### Secrets (Tier 1+)

Live Discord testing needs `DISCORD_TOKEN` in `.env` (from `.env.example`). Compose sets `REDIS_URL` for `bot`/`worker` when using Docker. Do not commit `.env`.
