import { z } from 'zod';

export const githubEventsSchema = z.object({
  push: z.boolean(),
  pull_request: z.boolean(),
  ci: z.boolean(),
  release: z.boolean(),
  issues: z.boolean(),
  deployment: z.boolean(),
});

export type GithubEvents = z.infer<typeof githubEventsSchema>;

export const EMPTY_GITHUB_EVENTS: GithubEvents = {
  push: false,
  pull_request: false,
  ci: false,
  release: false,
  issues: false,
  deployment: false,
};

export function hasEnabledGithubEvent(events: GithubEvents): boolean {
  return Object.values(events).some((enabled) => enabled);
}

export function githubEventsFromSlashOptions(options: {
  push: boolean | null;
  pr: boolean | null;
  ci: boolean | null;
  release: boolean | null;
  issues: boolean | null;
  deployment: boolean | null;
}): GithubEvents {
  return githubEventsSchema.parse({
    push: options.push ?? false,
    pull_request: options.pr ?? false,
    ci: options.ci ?? false,
    release: options.release ?? false,
    issues: options.issues ?? false,
    deployment: options.deployment ?? false,
  });
}

export const GITHUB_EVENT_LABELS: Record<keyof GithubEvents, string> = {
  push: 'push',
  pull_request: 'pull request',
  ci: 'CI',
  release: 'release',
  issues: 'issues',
  deployment: 'deployment',
};

export function formatEnabledGithubEvents(events: GithubEvents): string {
  return (Object.keys(GITHUB_EVENT_LABELS) as (keyof GithubEvents)[])
    .filter((key) => events[key])
    .map((key) => GITHUB_EVENT_LABELS[key])
    .join(', ');
}
