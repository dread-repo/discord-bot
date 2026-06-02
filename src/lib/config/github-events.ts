import { z } from 'zod';

export const githubEventsSchema = z.object({
  push: z.boolean().default(false),
  pull_request: z.boolean().default(false),
  ci: z.boolean().default(false),
  release: z.boolean().default(false),
  issues: z.boolean().default(false),
  deployment: z.boolean().default(false),
});

export type GitHubEvents = z.infer<typeof githubEventsSchema>;

export function parseGitHubEvents(raw: unknown): GitHubEvents {
  return githubEventsSchema.parse(raw ?? {});
}

export function hasAnyGitHubEvent(events: GitHubEvents): boolean {
  return Object.values(events).some(Boolean);
}
