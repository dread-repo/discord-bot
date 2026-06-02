# Feature Specification: GitHub Watcher

**Feature Branch**: `005-github-watcher`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md), [003-guild-watcher-config](../003-guild-watcher-config/spec.md)

**Input**: Receive GitHub webhooks for `dread-repo/dreadREPO`; post formatted announcements to guilds that enabled each event type—no role pings, deduplicated deliveries.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Community receives GitHub updates (Priority: P1)

Contributors and players see pushes, PRs, CI, releases, issues, and deployments per guild toggles.

**Independent Test**: [QS3](../001-dread-community-bot/quickstart.md) — fixture webhooks per event type.

**Acceptance Scenarios**: (from epic US3 — push, release buttons, CI failure clarity, LLM summary when oversized)

---

### Edge Cases

- Duplicate webhook delivery: dedupe by delivery id.
- Event type disabled for guild: no message for that guild.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST accept webhooks only for `dread-repo/dreadREPO`.
- **FR-002**: MUST verify webhook signature when secret configured.
- **FR-003**: MUST respect per-guild enabled event categories from spec 003.
- **FR-004**: MUST NOT ping roles on GitHub announcements.
- **FR-005**: Container messages with event type, ref/version, timestamp, branding; Thunderstore button only on release-related events.
- **FR-006**: MUST deduplicate by delivery identity.
- **FR-007**: LLM summary when body exceeds safe limits.

## Success Criteria *(mandatory)*

- **SC-001**: Each enabled event type produces correct message shape in fixture tests.
- **SC-002**: Duplicate deliveries do not double-post (epic SC-003).

## Assumptions

- Worker HTTP server from platform spec 002.
- Contract: [github-webhook](../001-dread-community-bot/contracts/github-webhook.md).

## Out of Scope

- Thunderstore polling (spec 004).
- Per-guild custom repos.
