# Checklist: GitHub Watcher Requirements Quality

**Purpose**: Validate spec/plan/contracts for webhook ingest, announce, dedupe, and guild event toggles  
**Created**: 2026-06-02  
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md)

## Requirement Completeness

- [x] CHK001 Are webhook signature and repo filter requirements specified? [Completeness, Spec §FR-001–002]
- [x] CHK002 Are per-guild enabled event categories linked to 003 `githubEventsSchema`? [Completeness, Spec §FR-003]
- [x] CHK003 Is “no role ping” explicit for GitHub announces? [Completeness, Spec §FR-004]
- [x] CHK004 Are Container layout requirements referenced to epic container contract? [Completeness, Spec §FR-005]
- [x] CHK005 Is dedupe by delivery id documented? [Completeness, Spec §FR-006]
- [x] CHK006 Are LLM summary requirements defined when body exceeds safe limit? [Completeness, Spec §FR-007]

## Requirement Clarity

- [x] CHK007 Is `WEBHOOK_PORT` default documented? [Clarity, Plan / contracts/github-http.md]
- [x] CHK008 Is internal event name `ci` vs GitHub `workflow_run` clarified? [Clarity, contracts/event-mapping.md]
- [x] CHK009 Are Thunderstore button rules on release-only stated? [Clarity, Spec §FR-005]
- [x] CHK010 Is behavior when `GITHUB_WEBHOOK_SECRET` unset defined for dev? [Clarity, research.md R2]
- [x] CHK021 Is production Cloudflare Tunnel + loopback Docker binding documented? [Completeness, contracts/deployment-cloudflare-tunnel.md]

## Requirement Consistency

- [x] CHK011 Do job payloads match [001 job-queues](../../001-dread-community-bot/contracts/job-queues.md) after `ci` alignment? [Consistency]
- [x] CHK012 Do announce rules match [container-message](../../001-dread-community-bot/contracts/container-message.md)? [Consistency]
- [x] CHK013 Is Thunderstore ping role excluded (004 owns ping)? [Consistency, Spec Out of Scope]

## Acceptance Criteria Quality

- [x] CHK014 Can SC-001 be verified via QS3 fixtures without live GitHub? [Measurability, Spec §SC-001]
- [x] CHK015 Can SC-002 (duplicate delivery) be tested with same `X-GitHub-Delivery`? [Measurability, Spec §SC-002]

## Scenario Coverage

- [x] CHK016 Are wrong-repo and invalid-signature responses specified? [Coverage, contracts/github-http.md]
- [x] CHK017 Are guilds with disabled event type excluded from fan-out? [Coverage, Spec Edge Cases]
- [x] CHK018 Are unmapped GitHub actions (ignored, 200) documented? [Coverage, research.md R4]

## Dependencies & Assumptions

- [x] CHK019 Is dependency on 003 `/github setup` explicit? [Dependency, Spec header]
- [x] CHK020 Is worker `DISCORD_TOKEN` for REST posts documented? [Dependency, quickstart.md]
