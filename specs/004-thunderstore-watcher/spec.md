# Feature Specification: Thunderstore Watcher & Global Packages

**Feature Branch**: `004-thunderstore-watcher`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md), [003-guild-watcher-config](../003-guild-watcher-config/spec.md)

**Input**: Poll Thunderstore for core/official plugin updates; announce to configured guilds with Container messages, deduplication, changelog or LLM summary, and link buttons. Official-guild admins register global packages for all guilds.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Community receives Thunderstore updates (Priority: P1)

Players see core and official plugin updates with version, changelog/summary, and Thunderstore/GitHub buttons.

**Independent Test**: [QS2](../001-dread-community-bot/quickstart.md)

**Acceptance Scenarios**: (from epic US2 — version metadata, full vs summarized changelog, buttons, dedupe on repeat version)

---

### User Story 2 - Global plugin registration (Priority: P2)

Official-guild administrators add packages to the global watch list.

**Independent Test**: Register in official guild `1510452344024727775`; denied elsewhere; new versions announce in configured guilds.

**Acceptance Scenarios**: (from epic US7)

---

### Edge Cases

- Thunderstore API down: retry with backoff; no false announcements.
- Package removed from manifest: dedupe prevents re-announce of old versions if re-added.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Watch **official manifest** ∪ **global_packages** table.
- **FR-002**: Post to each guild’s configured Thunderstore channel with **ping role** on each announcement.
- **FR-003**: Messages MUST use Container v2 via platform builder; include version, timestamp, core/plugin label, dread branding.
- **FR-004**: MUST include GitHub + Thunderstore link buttons when URLs exist.
- **FR-005**: MUST deduplicate by package version key.
- **FR-006**: MUST summarize oversized changelogs with labeled LLM summary when over safe limit.
- **FR-007**: Global register MUST be **official guild only**; affects all guilds.

## Success Criteria *(mandatory)*

- **SC-001**: 100% of test announcements include required metadata and buttons when URLs exist (epic SC-002).
- **SC-002**: Replay same version produces zero duplicate messages (epic SC-003).

## Assumptions

- Guild config from spec 003.
- Job queue `watcher:thunderstore` and `llm:changelog-summarize` per epic contracts.

## Out of Scope

- GitHub webhooks (spec 005).
