# Contract: GitHub event mapping

**Module**: `src/lib/watchers/github-event-mapper.ts`

## Input

- `githubEvent`: value of `X-GitHub-Event`
- `payload`: parsed JSON
- `deliveryId`: `X-GitHub-Delivery`

## Output

```ts
type MappedGithubEvent = {
  deliveryId: string;
  event: 'push' | 'pull_request' | 'ci' | 'release' | 'issues' | 'deployment';
  label: string;       // display label for AnnounceMeta
  body: string;        // markdown/plain summary
  versionOrRef: string;
  timestamp: Date;
  githubUrl: string;
  thunderstoreUrl?: string; // release only, when applicable
};
```

Return `null` when event should be ignored (wrong action/ref).

## Rules (summary)

| `X-GitHub-Event` | Accept when | Internal `event` |
|------------------|-------------|------------------|
| `push` | `ref` is `refs/heads/master` or `refs/heads/main` | `push` |
| `pull_request` | `action` ∈ opened, closed, merged | `pull_request` |
| `workflow_run` | `action` completed, branch is default | `ci` |
| `release` | `action` published | `release` |
| `issues` | `action` opened or closed | `issues` |
| `deployment_status` | `state` success or failure | `deployment` |

## Default branch detection

Use `payload.repository.default_branch` when comparing push/workflow refs.

## Fixtures

Store minimal JSON fixtures under `src/lib/watchers/fixtures/github/` for Vitest (push, release, workflow_run completed).
