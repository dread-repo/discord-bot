# Contract: BullMQ job queues

**Redis URL**: `REDIS_URL` (default `redis://redis:6379` in Compose)

## Job payloads (TypeScript shapes)

### `watcher:thunderstore`

```ts
type ThunderstoreWatchJob = { kind: 'poll' } | {
  kind: 'announce';
  packageKey: string;
  version: string;
};
```

### `watcher:github`

```ts
type GitHubWatchJob = {
  deliveryId: string;
  event: 'push' | 'pull_request' | 'workflow_run' | 'release' | 'issues' | 'deployment';
  payload: unknown; // validated per event
};
```

### `llm:changelog-summarize`

```ts
type ChangelogSummarizeJob = {
  source: 'thunderstore' | 'github';
  fullText: string;
  urls: { github?: string; thunderstore?: string };
  announceMeta: AnnounceMeta;
};
```

### `llm:announcement-review`

```ts
type AnnouncementReviewJob = {
  draftId: string;
  guildId: string;
  userId: string;
  content: string;
};
```

### `forum:post-pipeline`

```ts
type ForumPostJob = {
  guildId: string;
  threadId: string;
  channelId: string;
  starterMessageId: string;
  tagIds: string[];
  title: string;
  body: string;
};
```

### `index:repo-scan`

```ts
type RepoScanJob = {
  threadId: string;
  repo: string; // owner/repo
  question: string;
};
```

### `llm:dread-reply`

```ts
type DreadReplyJob = {
  guildId: string;
  channelId: string;
  messageId: string;
  content: string;
};
```

## Concurrency defaults

| Queue | concurrency |
|-------|-------------|
| `watcher:thunderstore` | 1 (poll), 3 (announce) |
| `watcher:github` | 5 |
| `llm:*` | 2 |
| `forum:post-pipeline` | 3 |
| `index:repo-scan` | 1 |

## Retry

- Default: 3 attempts, exponential backoff
- Discord 429: respect `retry_after`
- LLM 5xx: retry; 4xx: fail job
