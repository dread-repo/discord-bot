/** Official Dread Discord guild (global plugin register, forum). */
export const OFFICIAL_GUILD_ID = '1510452344024727775' as const;

/** GitHub organization for webhook fan-out (org-level webhook on `dread`). */
export const GITHUB_ORG = 'dread' as const;

/** True when `owner/repo` belongs to the watched GitHub organization. */
export function isWatchedGitHubRepository(fullName: string): boolean {
  const slash = fullName.indexOf('/');
  if (slash <= 0) return false;
  return fullName.slice(0, slash) === GITHUB_ORG;
}

export const MAX_ANNOUNCE_BODY_CHARS = 3500;
