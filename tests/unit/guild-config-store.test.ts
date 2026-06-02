import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

import { GuildConfigStore } from '../../src/lib/config/guild-config-store.js';

describe('GuildConfigStore', () => {
  it('upserts thunderstore config', async () => {
    const guildConfig = { upsert: vi.fn().mockResolvedValue({}) };
    const guildThunderstoreConfig = { upsert: vi.fn().mockResolvedValue({}) };
    const db = { guildConfig, guildThunderstoreConfig } as unknown as PrismaClient;
    const store = new GuildConfigStore(db);

    await store.setThunderstoreConfig('g1', 'ch1', 'role1');

    expect(guildConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { guildId: 'g1' } }),
    );
    expect(guildThunderstoreConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { guildId: 'g1' },
        create: { guildId: 'g1', channelId: 'ch1', pingRoleId: 'role1' },
      }),
    );
  });

  it('upserts github config with events', async () => {
    const guildConfig = { upsert: vi.fn().mockResolvedValue({}) };
    const guildGithubConfig = { upsert: vi.fn().mockResolvedValue({}) };
    const db = { guildConfig, guildGithubConfig } as unknown as PrismaClient;
    const store = new GuildConfigStore(db);

    await store.setGitHubConfig('g1', 'ch2', {
      push: true,
      pull_request: false,
      ci: false,
      release: true,
      issues: false,
      deployment: false,
    });

    const upsertCall = guildGithubConfig.upsert.mock.calls[0]?.[0] as {
      create: { events: { push: boolean; release: boolean } };
    };
    expect(upsertCall.create.events.push).toBe(true);
    expect(upsertCall.create.events.release).toBe(true);
    expect(upsertCall).toMatchObject({
      where: { guildId: 'g1' },
      create: { guildId: 'g1', channelId: 'ch2' },
    });
  });
});
