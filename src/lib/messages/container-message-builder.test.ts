import { describe, expect, it } from 'vitest';

import { buildAnnounceContainer } from './container-message-builder.js';

describe('buildAnnounceContainer', () => {
  it('builds thunderstore announcement with embed and Thunderstore link', () => {
    const result = buildAnnounceContainer({
      kind: 'thunderstore',
      label: 'core',
      versionOrRef: '1.0.0',
      timestamp: new Date('2026-06-02T12:00:00.000Z'),
      body: 'Changelog line',
      bodyIsLlmSummary: false,
      thunderstoreUrl: 'https://thunderstore.io/c/pkg/v/1.0.0/',
    });

    const serialized = JSON.stringify(result);
    expect(serialized).toContain('dread · core');
    expect(serialized).toContain('1.0.0');
    expect(serialized).toContain('Thunderstore');
  });

  it('prefixes LLM summary in body when flagged', () => {
    const result = buildAnnounceContainer({
      kind: 'github',
      label: 'release',
      versionOrRef: 'v2',
      timestamp: new Date('2026-06-02T12:00:00.000Z'),
      body: 'Short',
      bodyIsLlmSummary: true,
    });
    expect(JSON.stringify(result)).toContain('Summary (LLM)');
  });
});
