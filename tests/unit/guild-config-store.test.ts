import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import { GuildConfigStore } from '../../src/lib/config/guild-config-store.js';

describe('GuildConfigStore', () => {
  it('upserts thunderstore config', async () => {
    const from = vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    });
    const db = { from } as unknown as SupabaseClient;
    const store = new GuildConfigStore(db);

    await store.setThunderstoreConfig('g1', 'ch1', 'role1');

    expect(from).toHaveBeenCalledWith('guild_config');
    expect(from).toHaveBeenCalledWith('guild_thunderstore_config');
  });

  it('upserts github config with events', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });
    const db = { from } as unknown as SupabaseClient;
    const store = new GuildConfigStore(db);

    await store.setGitHubConfig('g1', 'ch2', {
      push: true,
      pull_request: false,
      ci: false,
      release: true,
      issues: false,
      deployment: false,
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        guild_id: 'g1',
        channel_id: 'ch2',
        events: expect.objectContaining({ push: true, release: true }) as unknown,
      }),
      { onConflict: 'guild_id' },
    );
  });
});
