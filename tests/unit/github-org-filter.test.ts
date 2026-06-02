import { describe, expect, it } from 'vitest';

import { GITHUB_ORGS, isWatchedGitHubRepository } from '../../src/lib/constants.js';

describe('isWatchedGitHubRepository', () => {
  it('accepts repositories under dread and dread-repo orgs', () => {
    expect(isWatchedGitHubRepository('dread/dreadREPO')).toBe(true);
    expect(isWatchedGitHubRepository('dread/discord-bot')).toBe(true);
    expect(isWatchedGitHubRepository('dread-repo/dreadREPO')).toBe(true);
    expect(isWatchedGitHubRepository('dread-repo/discord-bot')).toBe(true);
  });

  it('rejects other orgs and malformed names', () => {
    expect(isWatchedGitHubRepository('other-org/repo')).toBe(false);
    expect(isWatchedGitHubRepository('dread')).toBe(false);
    expect(isWatchedGitHubRepository('')).toBe(false);
  });

  it('lists both org slugs', () => {
    expect(GITHUB_ORGS).toContain('dread');
    expect(GITHUB_ORGS).toContain('dread-repo');
  });
});
