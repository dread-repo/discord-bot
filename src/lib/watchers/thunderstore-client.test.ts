import { describe, expect, it, vi } from 'vitest';

import { ThunderstoreClient } from './thunderstore-client.js';
import { parseThunderstorePackageResponse, thunderstoreVersionUrl } from './thunderstore-types.js';

describe('parseThunderstorePackageResponse', () => {
  it('reads latest version fields', () => {
    const result = parseThunderstorePackageResponse({
      latest: {
        version_number: '1.2.3',
        changelog: 'Fixes',
        date_created: '2024-01-01T00:00:00Z',
      },
    });
    expect(result.version).toBe('1.2.3');
    expect(result.changelog).toBe('Fixes');
    expect(result.dateCreated.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('falls back to first versions entry', () => {
    const result = parseThunderstorePackageResponse({
      versions: [{ version_number: '9.0.0', changelog: null }],
    });
    expect(result.version).toBe('9.0.0');
    expect(result.changelog).toBe('');
  });

  it('uses description when changelog is absent', () => {
    const result = parseThunderstorePackageResponse({
      latest: {
        version_number: '1.6.1',
        description: 'Atmospheric horror overhaul for R.E.P.O.',
      },
    });
    expect(result.changelog).toBe('Atmospheric horror overhaul for R.E.P.O.');
  });
});

describe('ThunderstoreClient', () => {
  it('fetchPackage parses successful API response', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          latest: { version_number: '2.0.0', changelog: 'Release' },
        }),
    });
    const client = new ThunderstoreClient(fetchFn);
    const latest = await client.fetchPackage('BepInEx', 'BepInExPack');
    expect(latest.version).toBe('2.0.0');
    expect(fetchFn).toHaveBeenCalledWith(
      'https://thunderstore.io/api/experimental/package/BepInEx/BepInExPack/',
    );
  });
});

describe('thunderstoreVersionUrl', () => {
  it('uses community slug in Thunderstore page URL', () => {
    expect(thunderstoreVersionUrl('repo', 'elytraking', 'Dread', '1.6.1')).toBe(
      'https://thunderstore.io/c/repo/p/elytraking/Dread/v/1.6.1/',
    );
  });
});
