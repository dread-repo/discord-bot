# Contract: Platform smoke (002 acceptance)

Not exposed in production guilds by default; used in dev/test to validate platform wiring.

## Slash command: `platform-smoke`

| Property | Value |
|----------|-------|
| Name | `platform-smoke` |
| Description | Verify platform stack (dev) |
| Default member permissions | Administrator |
| Ephemeral | yes |

### Handler flow

1. `deferReply({ ephemeral: true })`
2. Build Container via `buildAnnounceContainer` with fixed test `AnnounceMeta`
3. `enqueue('llm:dread-reply', 'smoke', { guildId, channelId, messageId, content: 'smoke' })` or dedicated test queue in vitest
4. `editReply` with container
5. Worker stub processor logs job id; test asserts job completed event

## Integration test (no Discord)

- Mock interaction object OR call handler function directly
- Assert enqueue called with expected queue name
- Worker test runs processor in-process with BullMQ test helpers

## Tier 0 unit tests

| Module | Assertion |
|--------|-----------|
| PermissionResolver | Matrix per [permission-resolver.md](./permission-resolver.md) |
| ContainerMessageBuilder | Snapshot `__fixtures__/` |
| WatcherDedupeStore | Second insert returns false |
| loadEnv | Missing `DISCORD_TOKEN` throws |
