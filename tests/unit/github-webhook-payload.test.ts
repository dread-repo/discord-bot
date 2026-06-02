import { describe, expect, it } from 'vitest';

import {
  shouldProcessGitHubWebhook,
} from '../../src/lib/watchers/github-webhook-payload.js';
import { buildGitHubAnnounceMeta } from '../../src/lib/watchers/github-announce-meta.js';

const pushMainPayload = {
  ref: 'refs/heads/main',
  repository: {
    full_name: 'dread/discord-bot',
    default_branch: 'main',
    html_url: 'https://github.com/dread/discord-bot',
  },
  head_commit: {
    id: 'abc1234567890',
    message: 'fix: webhook announce pipeline',
    url: 'https://github.com/dread/discord-bot/commit/abc1234567890',
  },
};

describe('shouldProcessGitHubWebhook', () => {
  it('accepts push to default branch (main)', () => {
    expect(shouldProcessGitHubWebhook('push', pushMainPayload)).toBe(true);
  });

  it('rejects push to feature branches', () => {
    expect(
      shouldProcessGitHubWebhook('push', {
        ...pushMainPayload,
        ref: 'refs/heads/feature/test',
      }),
    ).toBe(false);
  });

  it('accepts published releases', () => {
    expect(
      shouldProcessGitHubWebhook('release', {
        action: 'published',
        repository: pushMainPayload.repository,
        release: { tag_name: 'v1.0.0', html_url: 'https://example.com', body: 'notes' },
      }),
    ).toBe(true);
  });
});

describe('buildGitHubAnnounceMeta', () => {
  it('builds push announce metadata', () => {
    const meta = buildGitHubAnnounceMeta('push', pushMainPayload);
    expect(meta).toMatchObject({
      kind: 'github',
      label: 'push',
      versionOrRef: 'abc1234',
      body: 'fix: webhook announce pipeline',
      githubUrl: pushMainPayload.head_commit.url,
    });
  });
});
