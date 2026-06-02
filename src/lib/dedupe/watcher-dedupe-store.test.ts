import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock('../db/prisma.js', () => ({
  getPrisma: () => ({
    watcherDedupe: { create: createMock },
  }),
}));

import { WatcherDedupeStore } from './watcher-dedupe-store.js';

describe('WatcherDedupeStore', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns false on duplicate key (P2002)', async () => {
    createMock.mockRejectedValueOnce({ code: 'P2002' });
    const store = new WatcherDedupeStore();
    await expect(store.tryInsert('ts:foo@1.0.0')).resolves.toBe(false);
  });

  it('returns true on first insert', async () => {
    createMock.mockResolvedValueOnce({});
    const store = new WatcherDedupeStore();
    await expect(store.tryInsert('ts:foo@1.0.0')).resolves.toBe(true);
  });
});
