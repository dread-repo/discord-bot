import { describe, expect, it } from 'vitest';

import { buildGithubDedupeKey } from './github-dedupe.js';

describe('github-dedupe', () => {
  it('builds gh:deliveryId key', () => {
    expect(buildGithubDedupeKey('abc-delivery')).toBe('gh:abc-delivery');
  });
});
