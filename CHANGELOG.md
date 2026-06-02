# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Guild watcher setup (spec 003): `/thunderstore setup` and `/github setup` with permission-gated config upserts via `GuildConfigStore`
- Core platform (spec 002): Prisma schema and init migration, bot/worker bootstrap, BullMQ job queues with stub processors, guild/dedupe stores, permission resolver, announcement message builder, LLM gateway skeleton, `/platform-smoke` command, env validation, and config stubs
- GitHub Spec Kit (Specify) scaffolding and Cursor speckit skills
- Agent docs hub (`docs/agents/`) inspired by [dreadREPO](https://github.com/dread-repo/dreadREPO)
- Matt Pocock engineering skills under `.agents/skills/`
- Node/pnpm toolchain (strict TypeScript, ESLint, Vitest) with hardened `pnpm-workspace.yaml` installs
- Docker Compose stack: `bot`, `worker`, and Redis (`Dockerfile`, `.env.example`)
- [docs/development.md](docs/development.md) for local and container development
- Spec Kit feature [001-dread-community-bot](specs/001-dread-community-bot/) (spec, PRD, checklist)
