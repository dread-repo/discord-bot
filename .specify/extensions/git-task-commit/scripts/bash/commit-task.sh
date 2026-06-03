#!/usr/bin/env bash
# Commit working tree changes for one Spec Kit task (tasks.md T###).
set -euo pipefail

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../../../scripts/bash/common.sh
source "$SCRIPT_DIR/../../../../scripts/bash/common.sh"

usage() {
  echo "Usage: commit-task.sh T001 [--dry-run]" >&2
  exit 1
}

TASK_ID="${1:-}"
DRY_RUN=false
if [[ "$TASK_ID" == "--help" || "$TASK_ID" == "-h" || -z "$TASK_ID" ]]; then
  usage
fi
shift || true
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

if [[ ! "$TASK_ID" =~ ^T[0-9]{3}$ ]]; then
  echo "ERROR: task id must look like T001 (got: $TASK_ID)" >&2
  exit 1
fi

REPO_ROOT="$(get_repo_root)"
cd "$REPO_ROOT"

if ! has_git; then
  echo "ERROR: not a git repository" >&2
  exit 1
fi

BRANCH="$(get_current_branch)"
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  echo "ERROR: refusing to commit on branch '$BRANCH'. Use the feature branch (NNN-kebab-name)." >&2
  exit 1
fi

FEATURE_JSON="$REPO_ROOT/.specify/feature.json"
if [[ ! -f "$FEATURE_JSON" ]]; then
  echo "ERROR: missing .specify/feature.json" >&2
  exit 1
fi

FEATURE_DIR_REL="$(sed -n 's/.*"feature_directory"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$FEATURE_JSON" | head -1)"
if [[ -z "$FEATURE_DIR_REL" ]]; then
  echo "ERROR: could not read feature_directory from .specify/feature.json" >&2
  exit 1
fi

TASKS_FILE="$REPO_ROOT/$FEATURE_DIR_REL/tasks.md"
if [[ ! -f "$TASKS_FILE" ]]; then
  echo "ERROR: missing $TASKS_FILE" >&2
  exit 1
fi

TASK_LINE="$(grep -E "^- \[[ xX]\] ${TASK_ID} " "$TASKS_FILE" | head -1 || true)"
if [[ -z "$TASK_LINE" ]]; then
  echo "ERROR: no line for $TASK_ID in $TASKS_FILE" >&2
  exit 1
fi

TASK_DESC="$(echo "$TASK_LINE" | sed -E "s/^- \[[ xX]\] ${TASK_ID}( \[P\])?( \[US[0-9]+\])? //")"
FEAT_SLUG="$(basename "$FEATURE_DIR_REL")"
FEAT_NUM="$(echo "$FEAT_SLUG" | cut -d- -f1)"

commit_prefix="feat"
case "$TASK_DESC" in
  *[Ff]ix*|*[Bb]ug*) commit_prefix="fix" ;;
  *[Dd]oc*|*[Cc]hangelog*|*README*) commit_prefix="docs" ;;
  *[Tt]est*|*Vitest*) commit_prefix="test" ;;
  *[Cc][Ii]*) commit_prefix="ci" ;;
esac

COMMIT_MSG="${commit_prefix}(${FEAT_NUM}): complete ${TASK_ID}

${TASK_DESC}

Spec Kit: ${FEATURE_DIR_REL}/tasks.md"

if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to commit for ${TASK_ID}"
  exit 0
fi

if [[ "$DRY_RUN" == true ]]; then
  echo "--- dry-run commit message ---"
  printf '%s\n' "$COMMIT_MSG"
  echo "--- staged files would be ---"
  git status --short
  exit 0
fi

git add -A
# Unstage paths agents must not commit (AGENTS.md)
git reset HEAD -- .env 2>/dev/null || true
if [[ -d supabase/.temp ]]; then
  git reset HEAD -- supabase/.temp 2>/dev/null || true
fi
if git diff --cached --quiet; then
  echo "No staged changes after exclusions for ${TASK_ID}"
  exit 0
fi

git commit -m "$COMMIT_MSG"
echo "Committed ${TASK_ID} on branch ${BRANCH}"
