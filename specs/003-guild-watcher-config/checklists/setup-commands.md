# Checklist: Setup Commands Requirements Quality

**Purpose**: Validate spec/plan/contracts for `/thunderstore setup` and `/github setup` before implementation  
**Created**: 2026-06-02  
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md)

## Requirement Completeness

- [ ] CHK001 Are Thunderstore setup inputs (channel + ping role) explicitly required in requirements? [Completeness, Spec §FR-001]
- [ ] CHK002 Are all six GitHub event categories named consistently with epic data-model keys? [Completeness, Spec §FR-002]
- [ ] CHK003 Is partial configuration (Thunderstore-only or GitHub-only) documented as valid? [Completeness, Spec Edge Cases]
- [ ] CHK004 Are re-run / update semantics for existing guild rows specified? [Completeness, Spec Edge Cases]
- [ ] CHK005 Is permission denial behavior specified for all config commands? [Completeness, Spec §FR-003]

## Requirement Clarity

- [ ] CHK006 Is `config` permission defined by reference to 002 resolver actions (not ambiguous "staff")? [Clarity, Spec §FR-003]
- [ ] CHK007 Are success vs error reply visibility (ephemeral) explicitly required? [Clarity, Spec §FR-004]
- [ ] CHK008 Is the mapping from slash option `pr` to stored `pull_request` documented? [Clarity, Contract github-setup]
- [ ] CHK009 Is "at least one GitHub event enabled" validation stated in requirements or contracts? [Clarity, Gap → data-model validation]

## Requirement Consistency

- [ ] CHK010 Do 003 command names match [001 slash-commands](../001-dread-community-bot/contracts/slash-commands.md) table? [Consistency]
- [ ] CHK011 Do persisted field names align with [001 data-model](../001-dread-community-bot/data-model.md) tables? [Consistency]
- [ ] CHK012 Are permission rules consistent with 002 `PermissionResolver` config action? [Consistency, Spec §FR-003]

## Acceptance Criteria Quality

- [ ] CHK013 Can SC-001 (setup under 5 minutes) be verified without watcher features? [Measurability, Spec §SC-001]
- [ ] CHK014 Is SC-002 (zero unauthorized successes) testable via permission matrix? [Measurability, Spec §SC-002]

## Scenario Coverage

- [ ] CHK015 Are requirements defined for missing guild context (DM / unavailable guild)? [Coverage, Gap]
- [ ] CHK016 Are database failure / timeout requirements specified or intentionally deferred? [Coverage, Exception Flow, Gap]
- [ ] CHK017 Are requirements for invalid channel type (non-text) specified? [Coverage, Gap]

## Dependencies & Assumptions

- [ ] CHK018 Is dependency on 002 platform (router, store, deploy) explicit and sufficient? [Dependency, Spec Depends on]
- [ ] CHK019 Is assumption that Prisma schema already contains child tables validated against 002 migration? [Assumption, Plan]

## Notes

- Check items during PR review of spec/plan/contracts; not implementation QA.
