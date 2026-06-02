# Feature Specification: Dread Community Discord Bot

**Feature Branch**: `001-dread-community-bot`

**Created**: 2026-06-02

**Status**: Planned

**Input**: Multi-guild Discord bot for the dread-repo community: Thunderstore and GitHub watchers, LLM-assisted announcements, in-character Dread replies, official-guild support forum automation, utility commands, and guild-scoped moderation. All public bot surfaces use Discord Container (Components v2) messages. Deployed via Docker with Redis-backed job queue and Supabase per-guild configuration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Server staff configure watchers (Priority: P1)

A server administrator connects the bot to their community by registering where Thunderstore and GitHub updates should post, which GitHub event types they care about, and (for Thunderstore) which role to ping.

**Why this priority**: Without configuration, watchers deliver no value; this is the foundation for all notification features.

**Independent Test**: In a test guild, an authorized admin runs setup commands, enables at least one GitHub event type, registers a Thunderstore channel with a ping role, and verifies settings persist across bot restarts.

**Acceptance Scenarios**:

1. **Given** a member with Discord Administrator, bot-admin in that guild, or global admin (config rights), **When** they register a Thunderstore announcement channel and ping role, **Then** the guild’s Thunderstore updates are directed to that channel with that role mentioned on each announcement.
2. **Given** an authorized config user, **When** they register a GitHub announcement channel and enable pushes, CI, and releases, **Then** only those event types produce messages in that channel.
3. **Given** a user without config permission, **When** they attempt watcher setup, **Then** the bot denies the action with a clear ephemeral error.
4. **Given** GitHub watcher is configured, **When** an enabled event occurs on `dread-repo/dreadREPO`, **Then** a single consolidated announcement appears in the configured channel with no role ping.

---

### User Story 2 - Community receives Thunderstore updates (Priority: P1)

Players and modders in any configured guild see core and official plugin updates in one place, with version metadata, changelog (or summary), and links to Thunderstore and GitHub releases.

**Why this priority**: Primary outward value for the mod ecosystem.

**Independent Test**: Simulate or trigger a new package version; verify one Container message per version with correct core/plugin labeling, buttons, and deduplication on repeat checks.

**Acceptance Scenarios**:

1. **Given** the official package manifest includes core and plugins, **When** any listed package publishes a new version, **Then** every guild with Thunderstore configured receives an announcement containing version, timestamp, core-or-plugin name, and “dread” branding.
2. **Given** changelog text fits Discord limits, **When** the announcement is posted, **Then** the full changelog is shown without an LLM summary label.
3. **Given** changelog text exceeds safe limits, **When** the announcement is posted, **Then** an LLM-labeled summary is shown and the user is directed to Thunderstore/GitHub for the full text.
4. **Given** any Thunderstore announcement, **When** the message is displayed, **Then** it includes buttons linking to the GitHub release and Thunderstore release for that package/version.
5. **Given** the same version was already announced, **When** the watcher runs again, **Then** no duplicate announcement is sent.

---

### User Story 3 - Community receives GitHub updates (Priority: P1)

Contributors and players see `master`-branch activity and related GitHub events (commits, PRs, CI, releases, issues, deployments) in their configured channel, formatted consistently with Thunderstore announcements.

**Why this priority**: Keeps the community aligned with repository activity.

**Independent Test**: Deliver representative webhook payloads for each enabled event type; verify message shape, LLM summary when needed, and Thunderstore button only when release-related.

**Acceptance Scenarios**:

1. **Given** a guild enabled “pushes to master”, **When** a push lands on `master`, **Then** an announcement includes ref/commit context, timestamp, event type, dread branding, and a GitHub action button.
2. **Given** a release event, **When** the announcement is posted, **Then** both GitHub and Thunderstore buttons appear where applicable.
3. **Given** a CI failure on `master`, **When** CI events are enabled, **Then** the announcement clearly indicates failure/success and links to the workflow/run.
4. **Given** oversized release notes or commit bodies, **When** posted, **Then** an LLM-labeled summary is used with pointers to GitHub for full detail.

---

### User Story 4 - Staff publish polished announcements (Priority: P2)

Moderators and administrators draft server announcements with LLM-assisted formatting, preview them privately, and publish Container-formatted messages after explicit confirmation.

**Why this priority**: Reduces low-quality or unclear staff communications while keeping humans in control.

**Independent Test**: Run announcement flow with text that triggers LLM warnings; confirm ephemeral preview, “post anyway”, and final channel post only after Confirm.

**Acceptance Scenarios**:

1. **Given** a user with config-level permission, **When** they start an announcement, **Then** they receive ephemeral LLM feedback and a Container v2 preview.
2. **Given** the LLM flags style or clarity issues, **When** the user chooses “post anyway”, **Then** they can still publish after explicit confirmation.
3. **Given** a ready draft, **When** the user confirms, **Then** the message appears in the selected channel as a Container v2 message.
4. **Given** a user without config permission, **When** they start an announcement, **Then** access is denied.

---

### User Story 5 - Official support forum assistance (Priority: P2)

In the official Dread Discord server, new forum posts receive FAQ guidance, duplicate detection with staff review, and optional codebase-informed replies when system load and LLM budget allow.

**Why this priority**: Reduces support burden and duplicate threads for the primary community hub.

**Independent Test**: Create forum posts in a registered forum channel; verify FAQ post, duplicate suggestion with reference link and staff buttons, and conditional codebase reply with stored attempt history.

**Acceptance Scenarios**:

1. **Given** the official guild and a registered forum channel, **When** a user opens a new forum post, **Then** the bot posts FAQ content from the editable FAQ JSON source.
2. **Given** a post similar to an existing thread, **When** duplicate detection runs, **Then** staff see a message referencing the original post with “Close as duplicate” and “Not a duplicate” actions (no automatic close).
3. **Given** low queue load and sufficient LLM quota, **When** repo routing succeeds (tag → classifier → user command fallback), **Then** the bot attempts a codebase-based answer and stores the attempt for later responses in that thread.
4. **Given** repo routing fails, **When** processing completes, **Then** the user receives instructions to use the repo fallback command.
5. **Given** high load or exhausted LLM budget, **When** a new post arrives, **Then** FAQ and duplicate steps still run but codebase attempt is skipped.

---

### User Story 6 - Moderation and bot admin delegation (Priority: P2)

Guild staff use slash moderation tools (purge, ban, kick, timeout, role management, userinfo) and delegate bot-admin access without granting global moderation abroad.

**Why this priority**: Operational safety for community servers.

**Independent Test**: Verify moderation commands work for bot-admin and Discord Administrator in-guild; verify global admin from official guild cannot moderate other guilds; verify `/set-admin` requires Discord Administrator.

**Acceptance Scenarios**:

1. **Given** a bot-admin or Discord Administrator in a guild, **When** they run moderation commands, **Then** actions execute per Discord permissions and bot rules.
2. **Given** a global admin (official guild bot-admin) in another guild without local admin rights, **When** they run moderation commands there, **Then** access is denied.
3. **Given** a Discord Administrator, **When** they use set-admin to grant bot-admin, **Then** the target gains config and moderation rights per guild rules.
4. **Given** a user without bot-admin or Discord Administrator, **When** they run moderation commands, **Then** access is denied.

---

### User Story 7 - Global plugin registration (Priority: P2)

Official-guild administrators register additional Thunderstore packages so all guilds receive announcements for newly official plugins.

**Why this priority**: Supports modular core + many plugins without redeploying for every plugin.

**Independent Test**: Register a package in official guild; verify it appears in global list and triggers announcements in configured guilds.

**Acceptance Scenarios**:

1. **Given** an admin in official guild `1510452344024727775`, **When** they register a plugin, **Then** it is added to the global package list for all guilds.
2. **Given** an admin outside the official guild, **When** they attempt global plugin registration, **Then** access is denied.
3. **Given** a new global package version, **When** watchers run, **Then** configured guilds receive announcements in their Thunderstore channel.

---

### User Story 8 - In-character Dread replies (Priority: P3)

In allowlisted channels, the bot occasionally replies in character to messages discussing Dread, replying to the triggering message while avoiding support and announcement channels.

**Why this priority**: Community flavor; must not interfere with support or announcements.

**Independent Test**: Send messages in allowlisted vs forbidden channels; verify ~1% trigger rate (configurable), reply threading, and persona boundaries.

**Acceptance Scenarios**:

1. **Given** an allowlisted channel and a message matching dread triggers, **When** the random gate passes, **Then** the bot replies in-thread with in-character content grounded in the persona definition.
2. **Given** support forum or announcement channels, **When** dread is mentioned, **Then** the bot does not respond in character.
3. **Given** a non-allowlisted channel, **When** dread is mentioned, **Then** no in-character reply occurs.

---

### User Story 9 - Utility information commands (Priority: P3)

Any member can view bot features, readme content, and download links (Thunderstore, r2modman, GitHub) from bundled JSON configuration.

**Why this priority**: Self-serve onboarding; low risk.

**Independent Test**: Invoke `/features`, `/readme`, `/download` and verify Container v2 output matches JSON content.

**Acceptance Scenarios**:

1. **Given** bundled JSON configs, **When** a user runs utility commands, **Then** responses reflect current configured content.
2. **Given** an updated JSON config in a release, **When** the bot is redeployed, **Then** utility output updates without code changes.

---

### Edge Cases

- Bot restarts mid-announcement draft: draft state expires or can be recovered with clear user messaging.
- GitHub webhook duplicate delivery: deduplication prevents double posts.
- Thunderstore API unavailable: watcher retries with backoff; no spurious announcements.
- LLM provider outage: announcements allow “post anyway”; forum skips codebase step; changelog falls back to truncated raw text with links.
- Guild removes bot before config cleanup: rows may orphan; acceptable for v1.
- Rate limits on Discord API: queue workers retry; users see delayed but eventual posts.
- Forum post edited after initial bot response: no automatic re-run unless specified later (v1: initial post only).
- Package removed from global list: historical dedupe state prevents re-announcing old versions if re-added.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support multiple Discord guilds with per-guild configuration stored durably (channels, roles, enabled GitHub events, bot-admin assignments).
- **FR-002**: System MUST hardcode official Dread guild ID `1510452344024727775` for global plugin registration and official-only forum registration.
- **FR-003**: System MUST hardcode watched GitHub repository as `dread-repo/dreadREPO`.
- **FR-004**: System MUST ship an official Thunderstore package manifest (JSON) for core and official plugins and watch all listed packages plus globally registered packages.
- **FR-005**: System MUST post Thunderstore updates to one configured channel per guild with a configured ping role on each announcement.
- **FR-006**: System MUST post GitHub updates to one configured channel per guild with configurable event categories: pushes to `master`, pull requests, CI/Actions, releases, issues, deployments.
- **FR-007**: System MUST NOT ping roles on GitHub announcements.
- **FR-008**: All public bot messages (watchers, published announcements, utility commands, forum responses, moderation outputs where applicable) MUST use Discord Container (Components v2) layout.
- **FR-009**: Watcher and announcement messages MUST include version or ref, timestamp, event or package type (core vs plugin or GitHub event category), and dread branding.
- **FR-010**: Watcher messages MUST include action buttons for GitHub and Thunderstore when URLs exist; Thunderstore button on GitHub posts only when release-related.
- **FR-011**: When changelog or body text exceeds safe limits, system MUST post an LLM-labeled summary and direct users to Thunderstore or GitHub for full content.
- **FR-012**: System MUST deduplicate watcher announcements by package version and GitHub delivery identity.
- **FR-013**: Global plugin registration MUST only be available to administrators (bot-admin or Discord Administrator) in the official guild and MUST affect all guilds.
- **FR-014**: Announcement workflow MUST use ephemeral previews, LLM feedback, Confirm and Edit actions, and optional “post anyway” when LLM warns.
- **FR-015**: Announcement publishing MUST require explicit confirmation before posting to a selected channel.
- **FR-016**: Config permissions MUST allow Discord Administrator, bot-admin in guild, or global admin (official guild admin) for guild setup; global admin MUST NOT receive moderation rights in other guilds.
- **FR-017**: Moderation commands MUST require bot-admin or Discord Administrator in the same guild only.
- **FR-018**: Set-admin MUST require Discord Administrator in that guild.
- **FR-019**: Support forum automation MUST run only in the official guild after forum channel registration via command.
- **FR-020**: Support forum MUST post FAQ from editable JSON, detect duplicates with staff review buttons and reference to original post, and conditionally attempt codebase answers when load and LLM budget allow.
- **FR-021**: Support forum repo selection MUST use forum tags (primary), LLM classifier (secondary), and user fallback command with user-visible instructions on failure.
- **FR-022**: System MUST persist codebase support attempts for reuse in later LLM responses within the thread.
- **FR-023**: In-character Dread replies MUST use allowlisted channels, configurable low probability (initially 1%), reply to triggering message, follow strict persona, and exclude support and announcement channels.
- **FR-024**: Utility commands MUST serve features, readme, and download links from bundled JSON configuration.
- **FR-025**: Moderation commands MUST include purge, ban, kick, timeout, manage roles, userinfo, and bot administrator management.
- **FR-026**: Heavy work (watchers, LLM, repo scan, forum pipeline) MUST run asynchronously via a Redis-backed job queue; interaction handlers MUST acknowledge within Discord’s interaction time limits.
- **FR-027**: System MUST deploy as Docker services: bot process, worker process, and self-hosted Redis.

### Key Entities

- **Guild configuration**: Per-guild channels, roles, event toggles, bot-admin role and grants, allowlists for Dread replies.
- **Global package registry**: Thunderstore packages (manifest + administratively registered) with mapping to GitHub release sources.
- **Watcher state**: Last announced version/commit per package or event source for deduplication.
- **Forum attempt record**: Thread reference, selected repo, query context, generated answer summary, timestamps for reuse.
- **Announcement draft**: Ephemeral session holding draft text, LLM feedback state, target channel (pre-confirm).
- **FAQ document**: JSON-maintained question/answer entries for forum first response.
- **Repo routing map**: Forum tag to repository associations plus classifier-eligible repository list.
- **Utility content bundles**: JSON files for features list, readme sections, and download URLs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authorized staff can complete Thunderstore and GitHub channel setup in under 5 minutes without developer assistance.
- **SC-002**: 100% of watcher announcements in acceptance testing include required metadata (version/ref, timestamp, type label) and both link buttons when URLs exist.
- **SC-003**: Duplicate watcher deliveries do not produce duplicate channel messages in controlled replay tests.
- **SC-004**: Announcement authors receive LLM feedback on drafts within 30 seconds under normal load in acceptance testing.
- **SC-005**: Support forum new posts receive FAQ and duplicate-check responses within 60 seconds of creation under normal load.
- **SC-006**: Global administrators cannot successfully execute moderation actions in guilds where they lack local bot-admin or Discord Administrator rights (zero successes in permission test matrix).
- **SC-007**: Utility commands return correct content matching bundled JSON in 100% of scripted invocations.

## Assumptions

- Discord application has required intents approved (including Message Content for forum and allowlisted Dread reply channels).
- Supabase project is available for configuration and state; service credentials are provided to bot and worker via environment.
- GitHub webhooks can reach the deployment (TLS endpoint on VPS).
- Thunderstore exposes stable package/version metadata and changelog fields for watched packages.
- LLM API key and budget limits are configured via environment; soft gates are acceptable when budget is exhausted.
- Official package manifest is maintained in the bot repository; global register command updates durable global package storage.
- Initial Dread reply trigger rate is 1% and adjustable via configuration without spec amendment for exact percentage tweaks.
- r2modman and Thunderstore URLs in download JSON are maintained by maintainers at release time.
- Community primarily uses English for v1 content (FAQ, LLM prompts, announcements).

## Out of Scope (v1)

- Voice agent integration.
- Sharding and multi-region bot infrastructure beyond standard Discord.js scaling thresholds.
- Per-guild custom GitHub organizations or repositories.
- Automatic re-processing of edited forum posts.
- User-facing global plugin registration outside the official guild.
- Non-English localization.
