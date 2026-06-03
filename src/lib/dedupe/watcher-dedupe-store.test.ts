import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createMock, findUniqueMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  findUniqueMock: vi.fn(),
}));

vi.mock('../db/prisma.js', () => ({
  getPrisma: () => ({
    watcherDedupe: { create: createMock, findUnique: findUniqueMock },
  }),
}));

import { WatcherDedupeStore } from './watcher-dedupe-store.js';

describe('WatcherDedupeStore', () => {
  beforeEach(() => {
    createMock.mockReset();
    findUniqueMock.mockReset();
  });

  it('hasDedupeKey returns true when row exists', async () => {
    findUniqueMock.mockResolvedValueOnce({ dedupeKey: 'ts:foo@1.0.0' });
    const store = new WatcherDedupeStore();
    await expect(store.hasDedupeKey('ts:foo@1.0.0')).resolves.toBe(true);
  });

  it('hasDedupeKey returns false when row missing', async () => {
    findUniqueMock.mockResolvedValueOnce(null);
    const store = new WatcherDedupeStore();
    await expect(store.hasDedupeKey('ts:foo@1.0.0')).resolves.toBe(false);
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
