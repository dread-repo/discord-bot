import { describe, expect, it, vi } from 'vitest';

import { createPlatformSmokeHandler } from './platform-smoke.js';

describe('platform-smoke handler', () => {
  it('defers, enqueues, and edits reply', async () => {
    const enqueue = vi.fn().mockResolvedValue('job-1');
    const handler = createPlatformSmokeHandler({ enqueue } as never);

    const deferReply = vi.fn().mockResolvedValue(undefined);
    const editReply = vi.fn().mockResolvedValue(undefined);

    await handler({
      deferReply,
      editReply,
      guildId: 'guild-1',
      channelId: 'channel-1',
      id: 'interaction-1',
    } as never);

    expect(deferReply).toHaveBeenCalled();
    expect(enqueue).toHaveBeenCalledWith(
      'llm:dread-reply',
      'smoke',
      expect.objectContaining({ guildId: 'guild-1', content: 'smoke' }),
    );
    expect(editReply).toHaveBeenCalled();
  });
});
