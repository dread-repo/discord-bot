# Checklist: Thunderstore Watcher Requirements Quality

**Purpose**: Validate spec/plan/contracts for poll, announce, dedupe, and global register  
**Created**: 2026-06-02  
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md)

## Requirement Completeness

- [ ] CHK001 Are Thunderstore poll interval and backoff requirements specified? [Completeness, Gap]
- [ ] CHK002 Is the watch list defined as manifest ∪ `global_packages`? [Completeness, Spec §FR-001]
- [ ] CHK003 Are per-guild channel and ping role requirements linked to 003 config? [Completeness, Spec §FR-002]
- [ ] CHK004 Are Container message section requirements referenced to epic container contract? [Completeness, Spec §FR-003]
- [ ] CHK005 Is dedupe key format documented for version-level idempotency? [Completeness, Spec §FR-005]
- [ ] CHK006 Are LLM summary requirements defined when changelog exceeds safe limit? [Completeness, Spec §FR-006]

## Requirement Clarity

- [ ] CHK007 Is “safe limit” for changelog size quantified (e.g. MAX_BODY_CHARS)? [Clarity, Plan / announce-meta]
- [ ] CHK008 Are GitHub and Thunderstore button inclusion rules explicit? [Clarity, Spec §FR-004]
- [ ] CHK009 Is official guild ID for global register stated? [Clarity, Spec US2]
- [ ] CHK010 Is permission action name for global register aligned with 002 resolver? [Clarity, Contract plugin-register]

## Requirement Consistency

- [ ] CHK011 Do job payload shapes match [001 job-queues](../001-dread-community-bot/contracts/job-queues.md)? [Consistency]
- [ ] CHK012 Do announce layout rules match [container-message](../001-dread-community-bot/contracts/container-message.md)? [Consistency]
- [ ] CHK013 Is “no role ping on GitHub” excluded from this spec (005 scope)? [Consistency, Spec Out of Scope]

## Acceptance Criteria Quality

- [ ] CHK014 Can SC-001 (metadata + buttons) be verified via QS2 without live Thunderstore? [Measurability, Spec §SC-001]
- [ ] CHK015 Can SC-002 (zero duplicate on replay) be tested with enqueue + dedupe key? [Measurability, Spec §SC-002]

## Scenario Coverage

- [ ] CHK016 Are Thunderstore API down / retry requirements specified? [Coverage, Spec Edge Cases]
- [ ] CHK017 Are requirements defined when a guild channel is missing or bot lacks permissions? [Coverage, Gap]
- [ ] CHK018 Are requirements for package removed from manifest addressed? [Coverage, Spec Edge Cases]

## Dependencies & Assumptions

- [ ] CHK019 Is dependency on 003 guild Thunderstore config explicit? [Dependency, Spec Depends on]
- [ ] CHK020 Is assumption of stable Thunderstore API documented? [Assumption, research.md R1]

## Notes

- Review during PR of spec/plan/contracts; not implementation QA.
