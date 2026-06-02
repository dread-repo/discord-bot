# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- GitHub webhook announce processor: posts Container messages to guild channels configured via `/github setup` (push to default branch, PR, CI, release, issues, deployment)

### Added

- Prisma ORM for Postgres on Supabase (`DATABASE_URL`, `prisma/schema.prisma`, migrations)
- Bot foundation: Discord gateway client, BullMQ job queues, Prisma-backed config stores, Components v2 message builder

### Changed

- GitHub webhook watcher accepts any repository under the `dread` organization (was limited to `dread-repo/dreadREPO`)
- Replaced `@supabase/supabase-js` with Prisma Client; use `DATABASE_URL` (Supabase database URI) instead of `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`

### Documentation

- README setup guide: Prisma/Supabase, Docker Compose, smee.io (local GitHub webhooks), Cloudflare Tunnel (`cloudflared`)
- Worker: GitHub webhook HTTP server (`POST /webhooks/github`) and queue processor stubs
- Slash commands: `/thunderstore setup`, `/github setup` with permission gates (US1)
- Unit tests for permission resolver, container builder snapshots, and guild config store
- GitHub Spec Kit (Specify) scaffolding and Cursor speckit skills
- Agent docs hub (`docs/agents/`) inspired by [dreadREPO](https://github.com/dread-repo/dreadREPO)
- Matt Pocock engineering skills under `.agents/skills/`
- Node/pnpm toolchain (strict TypeScript, ESLint, Vitest) with hardened `pnpm-workspace.yaml` installs
- Docker Compose stack: `bot`, `worker`, and Redis (`Dockerfile`, `.env.example`)
- [docs/development.md](docs/development.md) for local and container development
- Spec Kit feature [001-dread-community-bot](specs/001-dread-community-bot/) (spec, PRD, checklist)
