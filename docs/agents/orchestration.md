# Agent orchestration workflows

How autonomous agents move from issue to merged PR. Pair with [README.md](README.md) for the file map.

## Workflow A: Solo agent (default)

```
ROADMAP / issue (ready-for-agent)
    -> CONTEXT.md + domain.md + relevant ADRs
    -> feature branch (feat/... or fix/...)
    -> implement (minimal diff)
    -> Tier 0 verify (npm test, npm run lint when defined)
    -> commit + push + PR to main
    -> CHANGELOG [Unreleased] if user-facing
```

### PR checklist

- [ ] Issue linked (`Fixes #NNN` or `Related to #NNN`)
- [ ] Glossary terms from CONTEXT.md in description when relevant
- [ ] Tier 0 verify passed (or failure documented)
- [ ] `[Unreleased]` updated when required

## Workflow B: Spec Kit feature

```
/speckit-specify -> specs/NNN-name/
    -> /speckit-plan, /speckit-tasks
    -> branch NNN-kebab-name
    -> /speckit-implement (or manual per tasks.md)
        -> per task: implement -> mark [X] -> git add (task files) -> commit-task.sh T###
    -> optional /speckit-analyze
    -> Tier 0 verify (full branch)
    -> push + PR to main (when user asks or opening PR)
```

Per-task commits: extension `git-task-commit` — [README](../../.specify/extensions/git-task-commit/README.md). Agents run `commit-task.sh` after each `tasks.md` item during implement.

See [AGENTS.md](../../AGENTS.md) for branch naming rules.

**Commits during implement:** [spec-kit-implement-commits.md](spec-kit-implement-commits.md) (required for agents).

## Workflow C: Multi-subagent (optional)

```
Issue + guide (optional)
    -> Subagent 1: implementer (.claude/implementer-prompt.md)
    -> Subagent 2: spec reviewer (.claude/spec-reviewer-prompt.md)
    -> Subagent 3: code quality reviewer (.claude/code-quality-reviewer-prompt.md)
    -> Lead agent: merge feedback, Tier 0 verify, PR
```

Implementer returns `DONE` or `DONE_WITH_CONCERNS` with git SHA. Reviewers return `APPROVED` or `ISSUES` with file:line references.

## Issue triage

| Label | Agent action |
|-------|----------------|
| `needs-triage` | Do not implement |
| `needs-info` | Ask reporter; do not guess |
| `ready-for-agent` | Implement when spec is clear |
| `ready-for-human` | Do not auto-implement |
| `wontfix` | Close; no PR |

Full mapping: [triage-labels.md](triage-labels.md). CLI: [issue-tracker.md](issue-tracker.md).

## When to write an ADR

- Cross-cutting protocol or API contract
- Security or privacy behavior
- Breaking change to public bot behavior

Put ADRs in `docs/adr/`. Mention ADR conflicts in the PR body.
