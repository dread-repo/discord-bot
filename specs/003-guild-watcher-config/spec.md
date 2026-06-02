# Feature Specification: Guild Watcher Configuration

**Feature Branch**: `003-guild-watcher-config`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md)

**Input**: Server staff register where Thunderstore and GitHub announcements are posted, which GitHub event types are enabled, and Thunderstore ping roles—persisted per guild with permission gates.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Server staff configure watchers (Priority: P1)

A server administrator connects the bot by registering Thunderstore and GitHub channels, event toggles, and ping role.

**Why this priority**: Watchers (specs 004, 005) cannot deliver value without per-guild config.

**Independent Test**: [QS1](../001-dread-community-bot/quickstart.md) — setup commands persist across bot restart; unauthorized users get ephemeral denial.

**Acceptance Scenarios**:

1. **Given** config permission (Discord Administrator, bot-admin, or global admin for config), **When** staff register Thunderstore channel and ping role, **Then** settings persist.
2. **Given** config permission, **When** staff register GitHub channel and enable pushes, CI, and releases, **Then** only those event types are stored for the guild.
3. **Given** no config permission, **When** user attempts setup, **Then** ephemeral error is shown.
4. **Given** GitHub config exists, **When** watchers run later, **Then** announcements use stored channel (verified in specs 004/005).

---

### Edge Cases

- Partial config (Thunderstore only or GitHub only) is valid.
- Re-running setup updates existing guild rows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist per-guild Thunderstore channel and ping role.
- **FR-002**: System MUST persist per-guild GitHub channel and enabled event categories (push, PR, CI, release, issues, deployment).
- **FR-003**: Config commands MUST use permission resolver **config** action from platform spec 002.
- **FR-004**: Setup responses MUST use ephemeral replies for errors; success feedback clear to staff.

### Key Entities

- **Guild Thunderstore config**, **Guild GitHub config**, **Guild config** (parent) — see [data-model](../001-dread-community-bot/data-model.md).

## Success Criteria *(mandatory)*

- **SC-001**: Authorized staff complete Thunderstore + GitHub setup in under 5 minutes (epic SC-001).
- **SC-002**: Unauthorized attempts succeed zero times in permission test matrix.

## Assumptions

- Platform stores and interaction routing from spec 002 exist.
- Slash command contract: [slash-commands](../001-dread-community-bot/contracts/slash-commands.md).

## Out of Scope

- Posting watcher announcements (specs 004, 005).
- Global plugin registration (spec 004).
