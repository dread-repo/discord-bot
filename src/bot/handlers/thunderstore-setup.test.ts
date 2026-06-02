import { describe, expect, it, vi } from 'vitest';

import { createThunderstoreSetupHandler } from './thunderstore-setup.js';

describe('thunderstore-setup handler', () => {
  it('denies when config permission is missing', async () => {
    const permissions = { can: vi.fn().mockResolvedValue(false) };
    const store = { upsertThunderstore: vi.fn() };
    const handler = createThunderstoreSetupHandler({ permissions, store } as never);

    const deferReply = vi.fn().mockResolvedValue(undefined);
    const editReply = vi.fn().mockResolvedValue(undefined);

    await handler({
      options: {
        getSubcommand: () => 'setup',
        getChannel: () => ({ id: 'ch-1' }),
        getRole: () => ({ id: 'role-1' }),
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
    expect(store.upsertThunderstore).not.toHaveBeenCalled();
    expect(editReply).toHaveBeenCalledWith({
      content: 'You do not have permission to configure watchers.',
    });
  });
});
