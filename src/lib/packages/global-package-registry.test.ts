import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createMock, findManyMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock('../config/load-bundled.js', () => ({
  loadOfficialPackagesManifest: vi.fn().mockResolvedValue([]),
}));

vi.mock('../db/prisma.js', () => ({
  getPrisma: () => ({
    globalPackage: {
      create: createMock,
      findMany: findManyMock,
    },
  }),
}));

import {
  DuplicateGlobalPackageError,
  GlobalPackageRegistry,
} from './global-package-registry.js';

describe('GlobalPackageRegistry.register', () => {
  beforeEach(() => {
    createMock.mockReset();
    findManyMock.mockResolvedValue([]);
  });

  it('persists a new global package', async () => {
    createMock.mockResolvedValueOnce({
      namespace: 'foo',
      name: 'bar',
      isCore: false,
      githubRepo: null,
      registeredBy: 'user-1',
    });
    const registry = new GlobalPackageRegistry();
    const row = await registry.register({
      namespace: 'foo',
      name: 'bar',
      isCore: false,
      registeredBy: 'user-1',
    });
    expect(row).toMatchObject({ namespace: 'foo', name: 'bar', source: 'database' });
  });

  it('throws DuplicateGlobalPackageError on P2002', async () => {
    createMock.mockRejectedValueOnce({ code: 'P2002' });
    const registry = new GlobalPackageRegistry();
    await expect(
      registry.register({
        namespace: 'foo',
        name: 'bar',
        isCore: false,
        registeredBy: 'user-1',
      }),
    ).rejects.toBeInstanceOf(DuplicateGlobalPackageError);
  });
});
