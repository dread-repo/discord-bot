import { describe, expect, it, vi } from 'vitest';

import type { MappedGithubEvent } from '../../lib/watchers/github-types.js';
import type { GithubWorkerDeps } from '../github-deps.js';
import { createGithubAnnounceProcessor } from './github-announce.js';

function sampleMapped(overrides: Partial<MappedGithubEvent> = {}): MappedGithubEvent {
  return {
    deliveryId: 'delivery-1',
    event: 'push',
    label: 'push',
    body: 'feat: example',
    versionOrRef: 'main',
    timestamp: new Date('2026-06-01T12:00:00Z'),
    githubUrl: 'https://github.com/dread-repo/dreadREPO/compare/abc',
    ...overrides,
  };
}

function createDeps(overrides: Partial<GithubWorkerDeps> = {}): GithubWorkerDeps {
  return {
    jobQueue: { enqueue: vi.fn().mockResolvedValue('job-1') },
    guildConfig: {
      listGithubGuilds: vi.fn().mockResolvedValue([
        {
          guildId: 'guild-1',
          channelId: 'channel-1',
          events: {
            push: true,
            pull_request: false,
            ci: false,
            release: false,
            issues: false,
            deployment: false,
          },
        },
      ]),
    },
    dedupe: {
      tryInsert: vi.fn().mockResolvedValue(true),
      hasDedupeKey: vi.fn(),
    },
    discord: {
      postAnnounceWithoutPing: vi.fn().mockResolvedValue(undefined),
      postAnnounce: vi.fn(),
    },
    registry: {
      listEffective: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  } as unknown as GithubWorkerDeps;
}

describe('github-announce processor', () => {
  it('posts to guilds with event enabled after dedupe insert', async () => {
    const tryInsert = vi.fn().mockResolvedValue(true);
    const postAnnounceWithoutPing = vi.fn().mockResolvedValue(undefined);
    const deps = createDeps({
      dedupe: { tryInsert, hasDedupeKey: vi.fn() },
      discord: { postAnnounceWithoutPing, postAnnounce: vi.fn() },
    } as unknown as Partial<GithubWorkerDeps>);
    const processor = createGithubAnnounceProcessor(deps);
    const mapped = sampleMapped();

    await processor({
      data: { deliveryId: mapped.deliveryId, event: mapped.event, mapped },
    } as Parameters<typeof processor>[0]);

    expect(tryInsert).toHaveBeenCalledWith('gh:delivery-1');
    expect(postAnnounceWithoutPing).toHaveBeenCalledTimes(1);
    expect(postAnnounceWithoutPing).toHaveBeenCalledWith(
      'channel-1',
      expect.objectContaining({ kind: 'github', label: 'push' }),
    );
  });

  it('skips post when dedupe insert fails', async () => {
    const postAnnounceWithoutPing = vi.fn().mockResolvedValue(undefined);
    const deps = createDeps({
      dedupe: {
        tryInsert: vi.fn().mockResolvedValue(false),
        hasDedupeKey: vi.fn(),
      },
      discord: { postAnnounceWithoutPing, postAnnounce: vi.fn() },
    } as unknown as Partial<GithubWorkerDeps>);
    const processor = createGithubAnnounceProcessor(deps);
    const mapped = sampleMapped();

    await processor({
      data: { deliveryId: mapped.deliveryId, event: mapped.event, mapped },
    } as Parameters<typeof processor>[0]);

    expect(postAnnounceWithoutPing).not.toHaveBeenCalled();
  });

  it('skips guild when event toggle is off', async () => {
    const postAnnounceWithoutPing = vi.fn().mockResolvedValue(undefined);
    const deps = createDeps({
      guildConfig: {
        listGithubGuilds: vi.fn().mockResolvedValue([
          {
            guildId: 'guild-1',
            channelId: 'channel-1',
            events: {
              push: false,
              pull_request: false,
              ci: false,
              release: false,
              issues: false,
              deployment: false,
            },
          },
        ]),
      },
      discord: { postAnnounceWithoutPing, postAnnounce: vi.fn() },
    } as unknown as Partial<GithubWorkerDeps>);
    const processor = createGithubAnnounceProcessor(deps);
    const mapped = sampleMapped();

    await processor({
      data: { deliveryId: mapped.deliveryId, event: mapped.event, mapped },
    } as Parameters<typeof processor>[0]);

    expect(postAnnounceWithoutPing).not.toHaveBeenCalled();
  });
});
