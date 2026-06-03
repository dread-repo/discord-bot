import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { mapGithubWebhook } from './github-event-mapper.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/github');

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, name), 'utf8')) as unknown;
}

describe('github-event-mapper', () => {
  it('maps push on default branch', () => {
    const payload = loadFixture('push-master.json');
    const mapped = mapGithubWebhook('push', payload, 'delivery-push');
    expect(mapped).not.toBeNull();
    expect(mapped?.event).toBe('push');
    expect(mapped?.versionOrRef).toBe('main');
  });

  it('maps release published', () => {
    const payload = loadFixture('release-published.json');
    const mapped = mapGithubWebhook('release', payload, 'delivery-release');
    expect(mapped?.event).toBe('release');
    expect(mapped?.versionOrRef).toBe('1.6.1');
  });

  it('maps workflow_run completed to ci', () => {
    const payload = loadFixture('workflow-run-completed.json');
    const mapped = mapGithubWebhook('workflow_run', payload, 'delivery-ci');
    expect(mapped?.event).toBe('ci');
  });

  it('ignores push to feature branch', () => {
    const payload = loadFixture('push-master.json') as Record<string, unknown>;
    const mapped = mapGithubWebhook(
      'push',
      { ...payload, ref: 'refs/heads/feature' },
      'delivery-feature',
    );
    expect(mapped).toBeNull();
  });
});
