# git-task-commit (Spec Kit extension)

One git commit per completed row in `tasks.md` during `/speckit-implement`.

## Commands

| Command | Cursor slash |
|---------|----------------|
| `speckit.git.commit.task` | `/speckit-git-commit-task` |

## Script

```bash
git add src/... specs/NNN-.../tasks.md   # this task only
.specify/extensions/git-task-commit/scripts/bash/commit-task.sh T009
```

The script commits **staged files only** (not `git add -A`). See [docs/agents/spec-kit-implement-commits.md](../../../docs/agents/spec-kit-implement-commits.md).

## Wiring

- Registered in [`.specify/extensions.yml`](../../extensions.yml)
- `/speckit-implement` skill requires staging + this script after each task is marked `[x]`
