import { describe, expect, it } from 'vitest';

import { buildThunderstoreDedupeKey, parsePackageKey } from './thunderstore-dedupe.js';

describe('thunderstore-dedupe', () => {
  it('builds ts:namespace/name@version key', () => {
    expect(buildThunderstoreDedupeKey('BepInEx/BepInExPack', '5.4.2100')).toBe(
      'ts:BepInEx/BepInExPack@5.4.2100',
    );
  });

  it('parses package key into namespace and name', () => {
    expect(parsePackageKey('dread-team/dread')).toEqual({
      namespace: 'dread-team',
      name: 'dread',
    });
  });

  it('rejects invalid package key', () => {
    expect(() => parsePackageKey('invalid')).toThrow(/Invalid package key/);
  });
});
