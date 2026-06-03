# Spec Kit: commits during and after implement

How agents (and humans) commit while running `/speckit-implement` on a feature branch.

**Related:** [orchestration.md](orchestration.md) workflow B · [AGENTS.md](../../AGENTS.md) · `.specify/extensions/git-task-commit/`

## Branch

- Must match the spec folder: `NNN-kebab-name` (e.g. `004-thunderstore-watcher`).
- **Never** commit feature work on `main` / `master`.
- `.specify/feature.json` → `feature_directory` must point at `specs/NNN-.../`.

## Per-task commits (during implement)

After **each** task in `tasks.md`:

1. Implement the task and run Tier 0 when the task touched code (`pnpm test`, `pnpm run lint`, `pnpm run build` from repo root).
2. Mark the task complete: `- [X] T###` in `FEATURE_DIR/tasks.md`.
3. **Stage only that task’s files** plus `tasks.md`:

   ```bash
   git add path/from/task.md FEATURE_DIR/tasks.md
   ```

   Do **not** rely on `commit-task.sh` to discover paths — it does not run `git add -A` anymore.

4. Commit with the helper:

   ```bash
   .specify/extensions/git-task-commit/scripts/bash/commit-task.sh T###
   ```

5. If the script prints `No staged changes`, stage the right paths and retry.
6. Continue to the next task.

### Dry run

```bash
.specify/extensions/git-task-commit/scripts/bash/commit-task.sh T012 --dry-run
```

### Cursor slash

`/speckit-git-commit-task T012` (same script).

## After implementation (batch catch-up)

If several tasks were implemented before commits (e.g. one session without per-task commits):

1. Confirm Tier 0 passes on the whole branch.
2. Split the diff into **one commit per task** (stage explicit paths per task, run `commit-task.sh T###` in task order).
3. Do **not** use a single squashed commit unless the user asks.

Optional follow-up commits (not tied to a single `T###`):

- Spec-only artifacts from `/speckit-plan` if not committed yet.
- `fix(NNN): …` for post-implement bugs found in QA.

## Push and PR

- **Push** only when the user asks or when opening/updating a PR ([AGENTS.md](../../AGENTS.md)).
- PR targets `main`; link spec folder and `Fixes #NNN` when applicable.

## Never commit

| Path | Reason |
|------|--------|
| `.env`, secrets | AGENTS.md |
| `supabase/.temp/`, `supabase/.branches/` | Local Supabase CLI cache (gitignored) |
| `.cursor/mcp.json` | Optional local MCP credentials |

## Commit message shape

Produced by `commit-task.sh`:

```text
feat(004): complete T012

<task description line from tasks.md>

Spec Kit: specs/004-thunderstore-watcher/tasks.md
```

Prefix `feat` / `fix` / `docs` / `test` / `chore` is inferred from the task description.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| One commit contains entire feature | You ran old `git add -A` flow; reset and recommit per task with explicit `git add`. |
| `refusing to commit on branch main` | `git checkout NNN-kebab-name`. |
| `no staged changes` | `git add` the task files before `commit-task.sh`. |
| `No changes to commit` | Task was docs-only checkbox or already committed — OK to continue. |
