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

### Phase 1: Dread Community Bot (Spec Kit split)

See [specs/SPEC-INDEX.md](../specs/SPEC-INDEX.md). Implement in order:

| Order | Spec | Priority | Depends on | Notes |
|-------|------|----------|------------|-------|
| 1 | `002-core-platform` | P0 | BOOT-1 | Prisma, bot/worker, Redis, permissions, Container builder |
| 2 | `003-guild-watcher-config` | P1 | 002 | Watcher channel setup |
| 3 | `004-thunderstore-watcher` | P1 | 003 | Thunderstore + global packages |
| 3 | `005-github-watcher` | P1 | 003 | GitHub webhooks (parallel with 004) |
| 4 | `006-staff-announcements` | P2 | 002, 003 | LLM announcement flow |
| 5 | `007-support-forum` | P2 | 002 | Official guild forum |
| 6 | `008-guild-moderation` | P2 | 002 | Mod + bot-admin |
| 7 | `009-dread-replies` | P3 | 002, 003 | In-character replies |
| 8 | `010-utility-commands` | P3 | 002 | /features, /readme, /download |

Epic umbrella: [001-dread-community-bot/EPIC.md](../specs/001-dread-community-bot/EPIC.md).

### Phase 2: Later features

| Order | ID | Priority | Issue | Depends on | Notes |
|-------|-----|----------|-------|------------|-------|
| | | | | | Add rows when issues exist |

---

## How to add rows

1. Create a GitHub issue with acceptance criteria.
2. Add a row with a short ID (e.g. `CMD-1`).
3. Apply triage labels per [docs/agents/triage-labels.md](agents/triage-labels.md).
