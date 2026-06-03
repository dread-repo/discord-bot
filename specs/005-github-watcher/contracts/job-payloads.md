# Contract: GitHub watcher jobs

**Queues**: `watcher:github`, `llm:changelog-summarize`  
**BullMQ names**: `watcher-github`, `llm-changelog-summarize` (via `toBullMqQueueName`)

## `watcher:github`

```ts
type GitHubWatchJob = {
  deliveryId: string;
  event: 'push' | 'pull_request' | 'ci' | 'release' | 'issues' | 'deployment';
  mapped: MappedGithubEvent; // mapped at ingest; see github-event-mapper.ts
};
```

**Note**: Internal `event` uses `ci` (not `workflow_run`). `mapped` is produced once in the HTTP handler and consumed by `github-announce`.

## Ingest flow

1. HTTP handler validates signature + repo.
2. `mapGithubWebhook` returns `MappedGithubEvent | null`.
3. If non-null → `jobQueue.enqueue('watcher:github', mapped.event, { deliveryId, event, mapped })`.

## `github-announce` processor

1. `tryInsert('gh:' + deliveryId)` — skip if false.
2. Build `AnnounceMeta` with `kind: 'github'`.
3. For each guild in `listGithubGuilds()` where `events[job.event]`, `DiscordRestPoster.postAnnounceWithoutPing(channelId, meta)`.

## `llm:changelog-summarize`

Same shape as 004; `source: 'github'`.

## Processor registration

| Component | File |
|-----------|------|
| HTTP route | `src/worker/http.ts` |
| Queue consumer | `src/worker/processors/github-announce.ts` |
| Wire-up | `src/worker/register-processors.ts` replace stub for `watcher:github` |
