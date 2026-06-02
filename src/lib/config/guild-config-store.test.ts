import { beforeEach, describe, expect, it, vi } from 'vitest';

const { guildConfigUpsert, thunderstoreUpsert, githubUpsert } = vi.hoisted(() => ({
  guildConfigUpsert: vi.fn(),
  thunderstoreUpsert: vi.fn(),
  githubUpsert: vi.fn(),
}));

vi.mock('../db/prisma.js', () => ({
  getPrisma: () => ({
    guildConfig: { upsert: guildConfigUpsert },
    guildThunderstoreConfig: { upsert: thunderstoreUpsert, findUnique: vi.fn() },
    guildGithubConfig: { upsert: githubUpsert, findUnique: vi.fn() },
  }),
}));

import { GithubEventsValidationError, GuildConfigStore } from './guild-config-store.js';

describe('GuildConfigStore watcher config', () => {
  beforeEach(() => {
    guildConfigUpsert.mockReset();
    thunderstoreUpsert.mockReset();
    githubUpsert.mockReset();
    guildConfigUpsert.mockResolvedValue({ guildId: 'guild-1' });
  });

  it('upserts thunderstore after ensuring guild row', async () => {
    thunderstoreUpsert.mockResolvedValueOnce({
      guildId: 'guild-1',
      channelId: 'ch-1',
      pingRoleId: 'role-1',
    });
    const store = new GuildConfigStore();
    const row = await store.upsertThunderstore('guild-1', 'ch-1', 'role-1');
    expect(guildConfigUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { guildId: 'guild-1' } }),
    );
    expect(thunderstoreUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { guildId: 'guild-1', channelId: 'ch-1', pingRoleId: 'role-1' },
      }),
    );
    expect(row.channelId).toBe('ch-1');
  });

  it('upserts github with enabled events', async () => {
    githubUpsert.mockResolvedValueOnce({
      guildId: 'guild-1',
      channelId: 'ch-2',
      events: { push: true, pull_request: false, ci: false, release: false, issues: false, deployment: false },
    });
    const store = new GuildConfigStore();
    await store.upsertGithub('guild-1', 'ch-2', {
      push: true,
      pull_request: false,
      ci: false,
      release: false,
      issues: false,
      deployment: false,
    });
    expect(githubUpsert).toHaveBeenCalled();
  });

  it('rejects github upsert when no event enabled', async () => {
    const store = new GuildConfigStore();
    await expect(
      store.upsertGithub('guild-1', 'ch-2', {
        push: false,
        pull_request: false,
        ci: false,
        release: false,
        issues: false,
        deployment: false,
      }),
    ).rejects.toBeInstanceOf(GithubEventsValidationError);
    expect(githubUpsert).not.toHaveBeenCalled();
  });
});
