import { describe, expect, it, vi } from 'vitest';

const { addMock, closeMock, quitMock } = vi.hoisted(() => ({
  addMock: vi.fn().mockResolvedValue({ id: 'job-1', name: 'smoke' }),
  closeMock: vi.fn().mockResolvedValue(undefined),
  quitMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('bullmq', () => ({
  Queue: class MockQueue {
    add = addMock;
    close = closeMock;
  },
}));

vi.mock('ioredis', () => ({
  Redis: class MockRedis {
    quit = quitMock;
  },
}));

import { JobQueue } from './job-queue.js';

describe('JobQueue', () => {
  it('enqueues jobs on named queue', async () => {
    const queue = new JobQueue('redis://127.0.0.1:6379');
    const id = await queue.enqueue('llm:dread-reply', 'smoke', {
      guildId: 'g1',
      channelId: 'c1',
      messageId: 'm1',
      content: 'smoke',
    });
    expect(id).toBe('job-1');
    expect(addMock).toHaveBeenCalledWith(
      'smoke',
      expect.objectContaining({ content: 'smoke' }),
      undefined,
    );
    await queue.close();
  });
});
