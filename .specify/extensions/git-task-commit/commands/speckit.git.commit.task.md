---
description: "Commit working tree changes for one completed Spec Kit task (tasks.md T###)"
---

# Git commit — Spec Kit task

Create **one commit** for a single completed task from the active feature's `tasks.md`.

## When to run

- **Mandatory** during `/speckit-implement` immediately after marking a task `[x]` in `tasks.md`.
- Optional standalone: `/speckit-git-commit-task T012` (pass the task id).

## Preconditions

- On the feature branch (e.g. `004-thunderstore-watcher`), not `main`.
- Task implementation done; `tasks.md` line for that task updated to `[x]`.
- Tier 0 checks for that task passed when the task touched code (at minimum: no broken build if you ran verify).

## Execution

From repository root:

```bash
.specify/extensions/git-task-commit/scripts/bash/commit-task.sh T012
```

Dry run (print message, do not commit):

```bash
.specify/extensions/git-task-commit/scripts/bash/commit-task.sh T012 --dry-run
```

## Agent steps

1. Finish the task implementation and mark `- [x] T###` in `FEATURE_DIR/tasks.md`.
2. Run `commit-task.sh` with that task id.
3. If the script exits non-zero, fix the issue before starting the next task.
4. If output is `No changes to commit`, either the task had no file changes (docs-only mark-only) or changes were already committed — continue.

## Commit message format

```
feat(004): complete T012

<Paste of task description line from tasks.md>

Spec Kit: specs/004-thunderstore-watcher/tasks.md
```

Prefix `feat`, `fix`, `docs`, or `test` is inferred from the task description when possible.

## Never commit

- `.env` and secret files
- `supabase/.temp/` (local Supabase CLI cache)
