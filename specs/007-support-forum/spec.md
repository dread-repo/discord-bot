# Feature Specification: Official Support Forum

**Feature Branch**: `007-support-forum`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md)

**Input**: In official guild only, automate new forum posts with FAQ, duplicate detection with staff review buttons, and optional codebase-informed replies when load and LLM budget allow.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Official support forum assistance (Priority: P2)

**Independent Test**: [QS5](../001-dread-community-bot/quickstart.md)

**Acceptance Scenarios**: (from epic US5 — FAQ, duplicate buttons, codebase attempt, repo fallback, skip codebase under load)

---

### Edge Cases

- Initial post only (no edit re-run in v1).
- Repo routing failure: user instructed to use fallback command.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Official guild `1510452344024727775` only; forum channel via register command.
- **FR-002**: FAQ from bundled JSON on new post.
- **FR-003**: Duplicate suggestion with link + staff Close/Not duplicate (no auto-close).
- **FR-004**: Repo routing: tag map → classifier → `/support repo` fallback.
- **FR-005**: Persist **forum_attempts** for thread continuity.
- **FR-006**: Skip codebase step when LLM budget or load gate fails; FAQ + duplicate still run.

## Success Criteria *(mandatory)*

- **SC-001**: FAQ + duplicate within 60 seconds of post under normal load (epic SC-005).

## Assumptions

- `config/faq.json`, `config/repo-tag-map.json` from platform stubs.
- Queues: `forum:post-pipeline`, `index:repo-scan`.

## Out of Scope

- Non-official guild forums.
