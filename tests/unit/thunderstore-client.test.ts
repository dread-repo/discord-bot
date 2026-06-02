import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchLatestPackageVersion } from '../../src/lib/watchers/thunderstore-client.js';

describe('fetchLatestPackageVersion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses latest version from experimental API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            latest: {
              version_number: '1.2.3',
              description: 'Changelog line',
              date_created: '2026-06-02T12:00:00.000Z',
              website_url: 'https://github.com/example/repo',
            },
          }),
      }),
    );

    const result = await fetchLatestPackageVersion('dread', 'Dread');
    expect(result).toMatchObject({
      namespace: 'dread',
      name: 'Dread',
      version: '1.2.3',
      description: 'Changelog line',
      thunderstoreUrl: 'https://thunderstore.io/package/dread/Dread/1.2.3/',
    });
  });

  it('returns null when package is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    expect(await fetchLatestPackageVersion('dread', 'Dread')).toBeNull();
  });
});
