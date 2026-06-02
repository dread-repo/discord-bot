import { describe, expect, it } from 'vitest';

import { GITHUB_ORG, isWatchedGitHubRepository } from '../../src/lib/constants.js';

describe('isWatchedGitHubRepository', () => {
  it('accepts any repository under the dread org', () => {
    expect(isWatchedGitHubRepository('dread/dreadREPO')).toBe(true);
    expect(isWatchedGitHubRepository('dread/discord-bot')).toBe(true);
  });

  it('rejects other orgs and malformed names', () => {
    expect(isWatchedGitHubRepository('dread-repo/dreadREPO')).toBe(false);
    expect(isWatchedGitHubRepository('other-org/repo')).toBe(false);
    expect(isWatchedGitHubRepository('dread')).toBe(false);
    expect(isWatchedGitHubRepository('')).toBe(false);
  });

  it('uses org login from GITHUB_ORG constant', () => {
    expect(GITHUB_ORG).toBe('dread');
  });
});
