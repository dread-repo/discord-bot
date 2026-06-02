# Contributing to discord-bot

## Before you start

| Resource | Purpose |
|----------|---------|
| [docs/ROADMAP.md](docs/ROADMAP.md) | Backlog and priorities |
| [docs/agents/README.md](docs/agents/README.md) | Agent orchestration hub |
| [docs/agents/orchestration.md](docs/agents/orchestration.md) | Workflows and PR checklist |
| [AGENTS.md](AGENTS.md) | Build, test, and agent policy |
| [CONTEXT.md](CONTEXT.md) | Domain glossary |

**Picking work:** Prefer issues labeled `ready-for-agent`. Comment before large changes.

**Verify locally** (when scripts exist):

```bash
npm test
npm run lint
```

## Building

When `package.json` is present:

```bash
npm install
npm run build
```

## Pull requests

- Target branch: `main`
- Link issues with `Fixes #NNN`
- Run Tier 0 verify before requesting review
- Update [CHANGELOG.md](CHANGELOG.md) `[Unreleased]` for user-visible changes

## Spec Kit features

For larger features, use Spec Kit (`/speckit-specify` through `/speckit-implement`) and store artifacts under `specs/NNN-feature-name/`. Follow branch naming in [AGENTS.md](AGENTS.md).
