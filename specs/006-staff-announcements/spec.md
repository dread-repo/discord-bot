# Feature Specification: Staff Announcements

**Feature Branch**: `006-staff-announcements`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md), [003-guild-watcher-config](../003-guild-watcher-config/spec.md)

**Input**: Staff draft server announcements with LLM feedback, preview in Container format ephemerally, and publish only after explicit confirmation—including “post anyway” when LLM warns.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Staff publish polished announcements (Priority: P2)

**Independent Test**: [QS4](../001-dread-community-bot/quickstart.md)

**Acceptance Scenarios**: (from epic US4 — ephemeral preview, post anyway, confirm to channel, permission denial)

---

### Edge Cases

- Bot restart mid-draft: TTL/expiry with clear user messaging.
- LLM outage: post anyway still available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Config permission required to start flow.
- **FR-002**: Ephemeral LLM feedback + Container preview.
- **FR-003**: Confirm and Edit actions; **post anyway** when LLM warns.
- **FR-004**: No public channel message before explicit confirm.
- **FR-005**: Persist draft sessions with TTL ([announcement_drafts](../001-dread-community-bot/data-model.md)).

## Success Criteria *(mandatory)*

- **SC-001**: LLM feedback within 30 seconds under normal load (epic SC-004).

## Out of Scope

- Watcher announcements (specs 004, 005).
