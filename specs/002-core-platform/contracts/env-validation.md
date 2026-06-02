# Contract: Environment validation (platform boot)

Validated in `src/lib/env.ts` via zod before `main()` / `runWorker()`.

## Required (all processes)

| Variable | Validation |
|----------|------------|
| `DISCORD_TOKEN` | Non-empty string (bot only) |
| `DATABASE_URL` | URL, must include pooler host or local dev |
| `REDIS_URL` | URL (worker + bot when enqueue used) |

## Required (bot only)

| Variable | Notes |
|----------|-------|
| `DISCORD_CLIENT_ID` | Application id for command registration |

## Required for migrations (CLI / deploy)

| Variable | Notes |
|----------|-------|
| `DIRECT_URL` | Direct Postgres — `prisma migrate deploy` |

## Optional

| Variable | Default behavior |
|----------|------------------|
| `LLM_PROVIDER` | If unset, `LlmGateway` no-op |
| `LLM_API_KEY` | If unset, skip LLM calls |
| `LLM_MODEL` | Provider default |
| `LLM_DAILY_TOKEN_BUDGET` | `budgetOk()` always true if unset |
| `GITHUB_WEBHOOK_SECRET` | Webhook route returns 503 if unset (worker, spec 005) |
| `LOG_LEVEL` | `info` |

## Failure behavior

- Missing required key → `process.exit(1)` after one error log listing all issues.
- Invalid URL format → same.
- No retry loop on startup.

## Docker Compose

`docker-compose.yml` sets `REDIS_URL=redis://redis:6379` for bot/worker; `.env` supplies Discord + database vars.
