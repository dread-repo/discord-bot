# Quickstart: Dread Community Discord Bot

Manual acceptance scenarios for Tier 1 (when Discord test guild available).

## Prerequisites

- Test Discord server with Administrator access
- Bot invited with scopes: `bot`, `applications.commands`
- Intents: Guilds, GuildMessages, MessageContent (forum + dread channels)
- `.env` from `.env.example` filled
- Supabase migrations applied
- `docker compose up` OR `pnpm run start:bot` + `pnpm run start:worker`

## QS1: Watcher setup (US1)

1. Run `/thunderstore setup` with `#announce` and `@ModRole`.
2. Run `/github setup` with `#announce` and events: push, ci, release.
3. Restart bot — configs still apply.
4. User without permission gets ephemeral error.

**Pass**: Steps 1–3 succeed; step 4 denied.

## QS2: Thunderstore announce (US2)

1. Bump a test package version in manifest OR use stub job enqueue.
2. Observe one Container message with version, timestamp, buttons.
3. Re-enqueue same version — no second message.

**Pass**: Single message; dedupe works.

## QS3: GitHub announce (US3)

1. Send fixture `push` webhook to `/webhooks/github`.
2. Verify message in configured channel, no role ping.
3. Send `release` webhook — GitHub + Thunderstore buttons when URLs set.

**Pass**: Format matches [contracts/container-message.md](./contracts/container-message.md).

## QS4: Announcement flow (US4)

1. `/announce` with messy text.
2. Receive ephemeral preview + LLM notes.
3. Click Post anyway → Confirm → message in target channel.

**Pass**: No public message before confirm.

## QS5: Forum pipeline (US5)

1. In official guild, `/forum register`.
2. Create forum post with known tag.
3. FAQ appears; duplicate suggestion links original if similar exists.
4. Under load, codebase step may skip — FAQ still present.

**Pass**: FAQ within 60s (SC-005).

## QS6: Moderation permissions (US6)

1. Grant bot-admin via `/config grant-admin` (as Discord Admin).
2. Bot-admin can `/userinfo`; non-admin cannot.
3. Official-guild global admin cannot `/ban` in other guild without local rights.

**Pass**: Matrix matches FR-016/017.

## QS7: Utilities (US9)

1. `/features`, `/readme`, `/download` return JSON-driven content.

**Pass**: Matches `config/*.json`.

## Tier 0 (CI, no Discord)

```bash
pnpm install
pnpm run build
pnpm run lint
pnpm test
```
