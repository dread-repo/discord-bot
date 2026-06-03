# git-task-commit (Spec Kit extension)

One git commit per completed row in `tasks.md` during `/speckit-implement`.

## Commands

| Command | Cursor slash |
|---------|----------------|
| `speckit.git.commit.task` | `/speckit-git-commit-task` |

## Script

```bash
.specify/extensions/git-task-commit/scripts/bash/commit-task.sh T009
```

## Wiring

- Registered in [`.specify/extensions.yml`](../../extensions.yml)
- `/speckit-implement` skill requires running the script after each task is marked `[x]`
