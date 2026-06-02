# Feature Specification: Utility Commands

**Feature Branch**: `010-utility-commands`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md)

**Input**: Any member invokes `/features`, `/readme`, and `/download` to read bot capabilities, readme sections, and install links from bundled JSON—rendered as Container v2 messages.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Utility information commands (Priority: P3)

**Independent Test**: [QS7](../001-dread-community-bot/quickstart.md)

**Acceptance Scenarios**: (from epic US9 — output matches JSON; updates on redeploy)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Load `config/features.json`, `readme.json`, `downloads.json`.
- **FR-002**: No permission gate (any member).
- **FR-003**: Responses MUST use Container v2 builder.

## Success Criteria *(mandatory)*

- **SC-001**: 100% scripted invocations match JSON (epic SC-007).

## Out of Scope

- Editing JSON via Discord (maintainer updates repo).
