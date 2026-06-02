# Spec Kit features

Each feature folder is named **`NNN-kebab-case`** (e.g. `002-core-platform`).

Typical contents (created via `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`):

- `spec.md` — requirements
- `plan.md` — technical plan
- `tasks.md` — implementation checklist
- `checklists/requirements.md` — spec quality gate

## Epic and index

| Doc | Purpose |
|-----|---------|
| [SPEC-INDEX.md](./SPEC-INDEX.md) | All features + dependency graph |
| [001-dread-community-bot/EPIC.md](./001-dread-community-bot/EPIC.md) | Umbrella PRD + child list |

## Implementation order

1. **002-core-platform** — bot, worker, Prisma, Redis, permissions, Container builder, queue  
2. **003-guild-watcher-config** — `/thunderstore setup`, `/github setup`  
3. **004-thunderstore-watcher** + **005-github-watcher** (parallel after 003)  
4. **006**–**010** by priority (see SPEC-INDEX)

Active feature pointer: `.specify/feature.json` (default: `specs/002-core-platform`).

Branch name should match the folder: `NNN-kebab-case`.

See [AGENTS.md](../AGENTS.md) and [docs/agents/orchestration.md](../docs/agents/orchestration.md).
