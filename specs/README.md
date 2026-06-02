# Spec Kit features

Each feature folder is named **`NNN-kebab-case`** (e.g. `001-bot-bootstrap`).

Typical contents (created via `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`):

- `spec.md` — requirements
- `plan.md` — technical plan
- `tasks.md` — implementation checklist

Active feature pointer: `.specify/feature.json` (when set). Branch name must match the folder: `NNN-kebab-case`.

See [AGENTS.md](../AGENTS.md) and [docs/agents/orchestration.md](../docs/agents/orchestration.md).
