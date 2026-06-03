---
name: speckit-git-commit-task
description: Commit working tree changes for one completed Spec Kit tasks.md item. Use during /speckit-implement after marking a task [x], or when user says commit task T009.
---

## User Input

```text
$ARGUMENTS
```

Task id from `$ARGUMENTS` (e.g. `T009`). If empty, use the task you just marked `[x]` in the current implement session.

## Steps

1. Confirm on a feature branch (not `main`).
2. Confirm the task line in active `tasks.md` is `[x]`.
3. Run:
   ```bash
   .specify/extensions/git-task-commit/scripts/bash/commit-task.sh <TASK_ID>
   ```
4. Report commit hash or `No changes to commit`.

Full contract: [.specify/extensions/git-task-commit/commands/speckit.git.commit.task.md](../../.specify/extensions/git-task-commit/commands/speckit.git.commit.task.md)
