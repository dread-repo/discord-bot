# Contract: Container v2 announcement message

All watcher and published announcement messages MUST conform to this layout.

## Sections (top to bottom)

1. **Header** — Text: `dread` + separator + label  
   - Thunderstore: `core` | `plugin: {name}`  
   - GitHub: `push` | `pull_request` | `ci` | `release` | `issues` | `deployment`

2. **Meta line** — `Version/ref: {value} · {ISO8601 timestamp}`

3. **Body** — Markdown text  
   - If length ≤ `MAX_BODY_CHARS` (e.g. 3500): full changelog/body  
   - Else: block prefixed with `**Summary (LLM)** — full details on Thunderstore/GitHub.`

4. **Action row** — Link buttons  
   - `GitHub` → commit/compare/release/workflow URL (required when URL exists)  
   - `Thunderstore` → package version URL (Thunderstore watcher always; GitHub only on `release` when mapped)

## Builder API

```ts
type AnnounceMeta = {
  kind: 'thunderstore' | 'github';
  label: string;
  versionOrRef: string;
  timestamp: Date;
  body: string;
  bodyIsLlmSummary: boolean;
  githubUrl?: string;
  thunderstoreUrl?: string;
};

function buildAnnounceContainer(meta: AnnounceMeta): MessageCreateOptions;
```

## Snapshot tests

Golden files in `src/lib/messages/__fixtures__/` for each event type and LLM-summary variant.
