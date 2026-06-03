# Contract: Thunderstore watcher jobs

**Queues**: `watcher:thunderstore`, `llm:changelog-summarize`  
**BullMQ name**: `watcher-thunderstore`, `llm-changelog-summarize` (via `toBullMqQueueName`)

## `watcher:thunderstore`

```ts
type ThunderstoreWatchJob =
  | { kind: 'poll' }
  | { kind: 'announce'; packageKey: string; version: string };
```

- `packageKey`: `{namespace}/{name}`
- Poll processor: discovers new versions → enqueue `announce` jobs (after dedupe insert succeeds).
- Announce processor: loads package metadata, builds `AnnounceMeta`, posts to all configured guilds.

## `llm:changelog-summarize` (when body > MAX_BODY_CHARS)

```ts
type ChangelogSummarizeJob = {
  source: 'thunderstore';
  fullText: string;
  urls: { github?: string; thunderstore?: string };
  announceMeta: AnnounceMeta;
};
```

After summarize completes, announce processor (or dedicated follow-up job) posts with `bodyIsLlmSummary: true`.

## Processor registration

| Job kind | File |
|----------|------|
| `poll` | `src/worker/processors/thunderstore-poll.ts` |
| `announce` | `src/worker/processors/thunderstore-announce.ts` |

Replace stub in `register-processors.ts` for queue `watcher:thunderstore`.
