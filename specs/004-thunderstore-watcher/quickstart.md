# Quickstart: Thunderstore Watcher (004)

**Prerequisites**: 002 on `main`, 003 configured in test guild, Redis + Postgres + worker running.

## QS2 — Thunderstore announce (US1)

1. Ensure test guild has `/thunderstore setup` (channel + ping role).
2. Start worker: `pnpm run start:worker` (poll runs on interval).
3. **Trigger new version** (pick one):
   - Temporarily bump version in `config/official-packages.json` test entry and mock client in dev, **or**
   - Manually enqueue: `watcher:thunderstore` job `{ kind: 'announce', packageKey: 'elytraking/Dread', version: '<new>' }` via worker debug helper.
4. Observe **one** Container message in configured channel with version, timestamp, dread branding, GitHub + Thunderstore buttons when URLs exist, and role ping.
5. Re-enqueue **same** `packageKey` + `version` → **no** second message (dedupe).

**Pass**: Single message; dedupe holds.

## US2 — Global register

1. In official guild `1510452344024727775`, run `/plugin register` as Administrator.
2. Run same command in another guild → denied.
3. After poll cycle, new package version announces in all guilds with Thunderstore config.

## Tier 0

```bash
pnpm test && pnpm run lint && pnpm run build
```
