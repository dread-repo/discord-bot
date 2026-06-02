# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

**See also:** [README.md](README.md), [orchestration.md](orchestration.md), [triage-labels.md](triage-labels.md).

Repository: `dread-repo/discord-bot` (https://github.com/dread-repo/discord-bot)

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`
- **List issues**: `gh issue list --state open --label ready-for-agent`
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` when using `gh` inside a clone.

## Agent workflow

1. List open work: filter by `ready-for-agent`
2. Read spec and comments before coding
3. Comment before large work: "Starting work on ..."
4. On PR open: `Fixes #<number>` in the PR body
5. Prefer roadmap-backed issues from [docs/ROADMAP.md](../ROADMAP.md)

## When a skill says "publish to the issue tracker"

Create a GitHub issue with acceptance criteria and labels per [triage-labels.md](triage-labels.md).

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.
