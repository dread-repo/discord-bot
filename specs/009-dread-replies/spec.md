# Feature Specification: In-Character Dread Replies

**Feature Branch**: `009-dread-replies`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: [002-core-platform](../002-core-platform/spec.md), [003-guild-watcher-config](../003-guild-watcher-config/spec.md)

**Input**: In allowlisted channels, occasionally reply in character to messages about Dread (~1% configurable), replying to the trigger message; never in forum or announcement channels.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - In-character Dread replies (Priority: P3)

**Acceptance Scenarios**: (from epic US8 — allowlist, probability gate, blocklist channels, persona)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Allowlist from guild config `dread_reply_channel_ids`.
- **FR-002**: Configurable low probability (default 1%).
- **FR-003**: Reply to triggering message; persona from `config/dread-persona.md`.
- **FR-004**: MUST NOT reply in support forum or announcement channels.
- **FR-005**: Heavy generation via `llm:dread-reply` queue.

## Out of Scope

- Voice agents.
