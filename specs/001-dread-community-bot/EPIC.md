# Epic: Dread Community Discord Bot

**Status**: Split into child Spec Kit features (2026-06-02)  
**Umbrella PRD**: [PRD.md](./PRD.md) (product vision for the full bot)  
**Original monolith**: [spec.md](./spec.md) (historical; superseded by children below)

## Child features (implementation order)

| Order | Spec | Branch | Depends on | Source stories |
|-------|------|--------|------------|----------------|
| 1 | [002-core-platform](../002-core-platform/spec.md) | `002-core-platform` | — | Platform / FR-008, FR-026, FR-027 |
| 2 | [003-guild-watcher-config](../003-guild-watcher-config/spec.md) | `003-guild-watcher-config` | 002 | US1 |
| 3a | [004-thunderstore-watcher](../004-thunderstore-watcher/spec.md) | `004-thunderstore-watcher` | 003 | US2, US7 |
| 3b | [005-github-watcher](../005-github-watcher/spec.md) | `005-github-watcher` | 003 | US3 |
| 4 | [006-staff-announcements](../006-staff-announcements/spec.md) | `006-staff-announcements` | 002, 003 | US4 |
| 5 | [007-support-forum](../007-support-forum/spec.md) | `007-support-forum` | 002 | US5 |
| 6 | [008-guild-moderation](../008-guild-moderation/spec.md) | `008-guild-moderation` | 002 | US6 |
| 7 | [009-dread-replies](../009-dread-replies/spec.md) | `009-dread-replies` | 002, 003 | US8 |
| 8 | [010-utility-commands](../010-utility-commands/spec.md) | `010-utility-commands` | 002 | US9 |

**Parallel after 003**: 004 and 005 may proceed in parallel.

**MVP milestone**: 002 → 003 → 004 + 005 (watchers live).

## Shared artifacts (remain in this folder)

| Artifact | Notes |
|----------|--------|
| [data-model.md](./data-model.md) | Full Postgres schema; owned by 002 implementation |
| [contracts/](./contracts/) | Cross-cutting contracts; child specs link here |
| [quickstart.md](./quickstart.md) | Tier 1 scenarios QS1–QS7 (map to child specs) |
| [plan.md](./plan.md), [research.md](./research.md), [tasks.md](./tasks.md) | Historical monolith plan; prefer child `spec.md` + future child plans |

## Active feature pointer

Set `.specify/feature.json` to the spec you are implementing (start with `specs/002-core-platform`).
