import { z } from 'zod';

export const githubInternalEventSchema = z.enum([
  'push',
  'pull_request',
  'ci',
  'release',
  'issues',
  'deployment',
]);

export type GithubInternalEvent = z.infer<typeof githubInternalEventSchema>;

export interface MappedGithubEvent {
  deliveryId: string;
  event: GithubInternalEvent;
  label: string;
  body: string;
  versionOrRef: string;
  timestamp: Date;
  githubUrl: string;
  thunderstoreUrl?: string;
}
