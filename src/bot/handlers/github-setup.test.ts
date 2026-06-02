import { describe, expect, it, vi } from 'vitest';

import { createGithubSetupHandler } from './github-setup.js';

describe('github-setup handler', () => {
  it('denies when config permission is missing', async () => {
    const permissions = { can: vi.fn().mockResolvedValue(false) };
    const store = { upsertGithub: vi.fn() };
    const handler = createGithubSetupHandler({ permissions, store } as never);

    const deferReply = vi.fn().mockResolvedValue(undefined);
    const editReply = vi.fn().mockResolvedValue(undefined);

    await handler({
      options: {
        getSubcommand: () => 'setup',
        getChannel: () => ({ id: 'ch-1' }),
        getBoolean: (name: string) => (name === 'push' ? true : null),
      },
      guildId: 'guild-1',
      memberPermissions: { bitfield: 0n },
      user: { id: 'user-1' },
      member: { roles: [] },
      deferReply,
      editReply,
    } as never);

    expect(deferReply).toHaveBeenCalled();
    expect(permissions.can).toHaveBeenCalledWith('config', expect.objectContaining({ guildId: 'guild-1' }));
    expect(store.upsertGithub).not.toHaveBeenCalled();
    expect(editReply).toHaveBeenCalledWith({
      content: 'You do not have permission to configure watchers.',
    });
  });
});
