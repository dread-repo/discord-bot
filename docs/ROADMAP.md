# discord-bot roadmap / backlog

Planned work tracked as issues. See [docs/agents/issue-tracker.md](agents/issue-tracker.md) for CLI conventions.

**Status key:** `idea`, `in-progress`, `blocked`, `done`

**Priority key:**

| Priority | Meaning |
|----------|---------|
| **P0** | Do first |
| **P1** | High value after P0 |
| **P2** | Polish |
| **P3** | Later or blocked |

---

## Execution order

Work top to bottom. Respect **Depends on** unless the dependency is explicitly done.

### Phase 0: Bootstrap

| Order | ID | Priority | Issue | Depends on | Notes |
|-------|-----|----------|-------|------------|-------|
| 1 | BOOT-1 | P0 | TBD | None | Node/TS project skeleton, Discord app wiring |
| 2 | BOOT-2 | P0 | TBD | BOOT-1 | CI: lint + test on PR |
| 3 | BOOT-3 | P1 | TBD | BOOT-1 | `/speckit-constitution` filled for this repo |

### Phase 1: First features

| Order | ID | Priority | Issue | Depends on | Notes |
|-------|-----|----------|-------|------------|-------|
| | | | | | Add rows when issues exist |

---

## How to add rows

1. Create a GitHub issue with acceptance criteria.
2. Add a row with a short ID (e.g. `CMD-1`).
3. Apply triage labels per [docs/agents/triage-labels.md](agents/triage-labels.md).
