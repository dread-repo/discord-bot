# Feature Specification: Guild Moderation & Bot Admin

**Feature Branch**: `008-guild-moderation`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md)

**Input**: Guild-scoped moderation slash commands and bot-admin delegation; global admins from official guild cannot moderate other guilds without local rights.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Moderation and bot admin delegation (Priority: P2)

**Independent Test**: [QS6](../001-dread-community-bot/quickstart.md)

**Acceptance Scenarios**: (from epic US6 — bot-admin mod, global admin denied abroad, set-admin requires Discord Administrator)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Commands: purge, ban, kick, timeout, manage roles, userinfo, set-admin / grant bot-admin.
- **FR-002**: Moderation requires bot-admin OR Discord Administrator **in same guild**.
- **FR-003**: Global admin MUST NOT moderate in guilds without local rights.
- **FR-004**: Set-admin requires Discord Administrator in guild.
- **FR-005**: Public moderation outputs use Container v2 where applicable.

## Success Criteria *(mandatory)*

- **SC-001**: Zero successful moderation by global admin abroad in test matrix (epic SC-006).

## Out of Scope

- Global plugin register (spec 004).
- Watcher config (spec 003).
