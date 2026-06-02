# Agent orchestration (discord-bot)

Entry point for coding agents (Cursor, Claude Code, Cloud Agents, and similar).

## Start here

| Step | Doc | Why |
|------|-----|-----|
| 1 | [CONTEXT.md](../../CONTEXT.md) | Domain vocabulary |
| 2 | [domain.md](domain.md) | ADRs, layout, how to read docs |
| 3 | [docs/ROADMAP.md](../ROADMAP.md) | Backlog and execution order |
| 4 | [orchestration.md](orchestration.md) | Issue → implement → verify → PR |
| 5 | [AGENTS.md](../../AGENTS.md) | Build, Spec Kit, version control |

## File index

| File | Role |
|------|------|
| [orchestration.md](orchestration.md) | Solo, subagent, verify, release workflows |
| [issue-tracker.md](issue-tracker.md) | GitHub Issues (`gh` CLI) |
| [triage-labels.md](triage-labels.md) | Label vocabulary |
| [domain.md](domain.md) | CONTEXT + ADR consumption |
| [../../AGENTS.md](../../AGENTS.md) | Build and policy |
| [guides/README.md](guides/README.md) | Implementation guides (add over time) |
| [../../.agents/skills/](../../.agents/skills/) | Matt Pocock engineering skills |
| [../../.cursor/skills/](../../.cursor/skills/) | Spec Kit (speckit-*) skills |
| [../../.claude/](../../.claude/) | Subagent prompt templates |

## Spec Kit vs plain issues

| Mode | When | Branch |
|------|------|--------|
| Spec Kit | `.specify/feature.json` points at `specs/NNN-.../` | `NNN-kebab-name` |
| Plain issue | No active Spec Kit plan | `feat/...` or `fix/...` |

## Picking work

1. Open [docs/ROADMAP.md](../ROADMAP.md) execution order.
2. Confirm the linked issue has `ready-for-agent`.
3. Comment on the issue before large edits.
4. Reference roadmap IDs in the PR when applicable.

## Engineering skills

Installed under `.agents/skills/` from [mattpocock/skills](https://github.com/mattpocock/skills). Examples: `/tdd`, `/diagnose`, `/to-issues`, `/triage`. Repo-specific tracker and label config is in this folder; re-run `/setup-matt-pocock-skills` if you change issue workflow.
