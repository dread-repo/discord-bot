#!/bin/sh
set -eu
if [ -n "${DIRECT_URL:-}" ] || [ -n "${DATABASE_URL:-}" ]; then
  pnpm db:migrate:deploy
fi
exec "$@"
