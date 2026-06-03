# Contract: GitHub watcher jobs

**Queues**: `watcher:github`, `llm:changelog-summarize`  
**BullMQ names**: `watcher-github`, `llm-changelog-summarize` (via `toBullMqQueueName`)

## `watcher:github`

```ts
type GitHubWatchJob = {
  deliveryId: string;
  event: 'push' | 'pull_request' | 'ci' | 'release' | 'issues' | 'deployment';
  payload: unknown; // raw GitHub JSON for mapper in processor
};
```

**Note**: Align `queue-types.ts` `GitHubWatchJob.event` with `ci` (not `workflow_run`) during implementation.

## Ingest flow

1. HTTP handler validates signature + repo.
2. `github-event-mapper` returns `{ event, deliveryId } | null`.
3. If non-null → `jobQueue.enqueue('watcher:github', event, job)`.

## `github-announce` processor

1. `tryInsert('gh:' + deliveryId)` — skip if false.
2. Build `AnnounceMeta` with `kind: 'github'`.
3. For each guild in `listGithubGuilds()` where `events[job.event]`, `DiscordRestPoster.postAnnounce(channelId, meta)` **no ping role** (pass empty mention or dedicated method without mention).

## `llm:changelog-summarize`

Same shape as 004; `source: 'github'`.

## Processor registration

| Component | File |
|-----------|------|
| HTTP route | `src/worker/http.ts` |
| Queue consumer | `src/worker/processors/github-announce.ts` |
| Wire-up | `src/worker/register-processors.ts` replace stub for `watcher:github` |
