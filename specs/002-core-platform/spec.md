# Feature Specification: Core Platform (Bot, Worker, Data, Queue)

**Feature Branch**: `002-core-platform`

**Created**: 2026-06-02

**Status**: Draft

**Epic**: [001 EPIC](../001-dread-community-bot/EPIC.md) · **Depends on**: none (implement first)

**Input**: Shared runtime for the Dread Community Discord bot: two-process deployment (gateway bot + background worker), durable configuration storage, Redis job queue, permission and message-building foundations, and interaction framework so feature specs can add commands and jobs without re-solving infrastructure.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operator runs the platform stack (Priority: P1)

A platform operator starts bot, worker, and Redis (Docker or local), applies database migrations, and confirms both processes connect to Postgres and Redis without handling Discord feature traffic yet.

**Why this priority**: Every other feature spec depends on this stack.

**Independent Test**: With valid env vars, `docker compose up` (or equivalent) yields healthy bot and worker logs, migrated schema visible in the database host, and Redis reachable from both processes.

**Acceptance Scenarios**:

1. **Given** valid Discord token and database URLs, **When** the bot process starts, **Then** it connects to the Discord gateway and logs readiness.
2. **Given** valid Redis URL, **When** the worker starts, **Then** it connects to Redis and registers queue consumers (stubs acceptable until feature specs add processors).
3. **Given** a fresh database, **When** migrations are applied, **Then** all tables defined in the epic data model exist.
4. **Given** bot and worker running, **When** either process stops, **Then** database connections are closed cleanly.

---

### User Story 2 - Feature modules plug into shared services (Priority: P1)

A maintainer adds a new slash command or background job using the shared permission resolver, Container message builder, job enqueue API, and guild configuration store—without changing process layout.

**Why this priority**: Proves the platform boundaries that child specs rely on.

**Independent Test**: A smoke slash command returns a Container v2 ephemeral reply; a smoke job enqueued from an interaction is picked up by the worker within a bounded time in tests.

**Acceptance Scenarios**:

1. **Given** the interaction router, **When** a registered smoke command runs, **Then** the handler acknowledges within Discord interaction time limits and replies using the shared message builder.
2. **Given** the job queue wrapper, **When** a test job is enqueued, **Then** the worker invokes the registered processor.
3. **Given** the permission resolver, **When** unit tests cover config vs moderate actions, **Then** global admin abroad is denied moderation per epic rules.

---

### Edge Cases

- Database unreachable at startup: process fails fast with clear logs (no silent retry loop).
- Redis unavailable: worker fails fast; bot may start but cannot enqueue (documented).
- Migration pending in production: deploy runs `migrate deploy` before serving traffic.
- Duplicate migration apply: idempotent deploy is safe.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST run as separate **bot** (gateway + interactions) and **worker** (jobs + optional HTTP webhook server) processes.
- **FR-002**: System MUST deploy with **Redis** for a durable job queue and **Postgres** (Supabase-hosted) for guild and platform state per epic [data-model](../001-dread-community-bot/data-model.md).
- **FR-003**: System MUST expose a **permission resolver** supporting actions: config, moderate, globalPluginRegister, setBotAdmin, officialForumRegister—with global admin unable to moderate outside their guild rights.
- **FR-004**: System MUST provide a **Container (Components v2) message builder** for all public message shapes (feature specs supply template data).
- **FR-005**: System MUST provide a **job queue** abstraction with named queues per [job-queues contract](../001-dread-community-bot/contracts/job-queues.md); interaction handlers MUST defer heavy work via enqueue.
- **FR-006**: System MUST acknowledge Discord interactions within platform time limits (enqueue or defer, not block on LLM/HTTP).
- **FR-007**: System MUST validate required environment configuration at startup (Discord token, Redis, database URLs).
- **FR-008**: System MUST hardcode official guild ID `1510452344024727775` and GitHub repo `dread-repo/dreadREPO` as platform constants for downstream specs.
- **FR-009**: System MUST include an **LLM gateway** skeleton with budget gate (no-op adapter acceptable for tests).
- **FR-010**: System MUST load bundled JSON from `config/` stubs (official packages manifest path, persona file path) for downstream features.

### Key Entities

- **Guild configuration** (store): CRUD interface; full schema in epic data model.
- **Watcher dedupe** (store): Idempotent announce keys.
- **Global packages** (registry interface): Manifest + DB merge (implementation may be stub until spec 004).
- **Job**: Queue name + payload envelope for worker routing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operator can complete first-time migrate + dual-process start in under 15 minutes following development docs.
- **SC-002**: Tier 0 CI (`test` + `lint`) passes with platform modules unit-tested (permissions, message builder snapshots, queue enqueue mock).
- **SC-003**: Smoke interaction and smoke job complete in integration tests without live Discord.
- **SC-004**: No public feature commands from other specs are required to validate platform readiness.

## Assumptions

- Child specs add business commands and processors on top of this platform.
- Postgres access uses Prisma ORM per [ADR-0002](../../docs/adr/0002-prisma-on-supabase-postgres.md).
- Docker Compose layout (bot, worker, redis) matches epic PRD.

## Dependencies

- None (first spec in epic).

## Out of Scope

- Thunderstore/GitHub watcher logic (specs 004, 005).
- Guild setup slash commands (spec 003).
- Staff announcements, forum, moderation, Dread replies, utilities (specs 006–010).
