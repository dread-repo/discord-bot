/** Official Dread Discord guild (global plugin register, forum). */
export const OFFICIAL_GUILD_ID = '1510452344024727775' as const;

/**
 * GitHub orgs whose repository webhooks we accept.
 * Repos currently live under `dread-repo`; include `dread` when the org webhook moves there.
 */
export const GITHUB_ORGS = ['dread', 'dread-repo'] as const;

/** @deprecated Use `GITHUB_ORGS` — primary community org slug on GitHub today. */
export const GITHUB_ORG = 'dread-repo' as const;

/** True when `owner/repo` belongs to a watched GitHub organization. */
export function isWatchedGitHubRepository(fullName: string): boolean {
  const slash = fullName.indexOf('/');
  if (slash <= 0) return false;
  const owner = fullName.slice(0, slash);
  return (GITHUB_ORGS as readonly string[]).includes(owner);
}

export const MAX_ANNOUNCE_BODY_CHARS = 3500;
