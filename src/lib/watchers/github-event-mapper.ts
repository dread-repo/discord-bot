import { z } from 'zod';

import { GITHUB_EVENT_LABELS, type GithubEvents } from '../config/github-events.js';
import type { AnnounceMeta } from '../messages/announce-meta.js';
import type { GithubInternalEvent, MappedGithubEvent } from './github-types.js';

const repositorySchema = z.object({
  full_name: z.string(),
  default_branch: z.string().optional(),
  html_url: z.string().optional(),
});

function repositoryFromPayload(payload: unknown): z.infer<typeof repositorySchema> | null {
  const parsed = z.object({ repository: repositorySchema }).safeParse(payload);
  return parsed.success ? parsed.data.repository : null;
}

function defaultBranch(repo: z.infer<typeof repositorySchema>): string {
  return repo.default_branch ?? 'main';
}

function isDefaultBranchRef(ref: string, branch: string): boolean {
  return ref === `refs/heads/${branch}` || ref === 'refs/heads/main' || ref === 'refs/heads/master';
}

function repoUrl(repo: z.infer<typeof repositorySchema>): string {
  return repo.html_url ?? 'https://github.com/dread-repo/dreadREPO';
}

export function mapGithubWebhook(
  githubEvent: string,
  payload: unknown,
  deliveryId: string,
): MappedGithubEvent | null {
  const repo = repositoryFromPayload(payload);
  if (repo === null) {
    return null;
  }

  const branch = defaultBranch(repo);
  const base = repoUrl(repo);

  switch (githubEvent) {
    case 'push': {
      const parsed = z
        .object({
          ref: z.string(),
          compare: z.string().optional(),
          head_commit: z
            .object({
              message: z.string().optional(),
              timestamp: z.string().optional(),
              id: z.string().optional(),
            })
            .optional(),
        })
        .safeParse(payload);
      if (!parsed.success || !isDefaultBranchRef(parsed.data.ref, branch)) {
        return null;
      }
      const ref = parsed.data.ref.replace('refs/heads/', '');
      const message = parsed.data.head_commit?.message?.trim() ?? 'Push to default branch';
      const compare = parsed.data.compare ?? `${base}/commits/${parsed.data.head_commit?.id ?? ''}`;
      return buildMapped(deliveryId, 'push', message, ref, compare, parsed.data.head_commit?.timestamp);
    }
    case 'pull_request': {
      const parsed = z
        .object({
          action: z.string(),
          pull_request: z.object({
            title: z.string(),
            html_url: z.string(),
            merged: z.boolean().optional(),
            merged_at: z.string().nullable().optional(),
            updated_at: z.string().optional(),
            number: z.number(),
          }),
        })
        .safeParse(payload);
      if (!parsed.success) {
        return null;
      }
      const { action, pull_request: pr } = parsed.data;
      if (action !== 'opened' && action !== 'closed') {
        return null;
      }
      const detail =
        action === 'opened'
          ? `opened #${String(pr.number)}`
          : pr.merged === true || pr.merged_at !== null
            ? `merged #${String(pr.number)}`
            : `closed #${String(pr.number)}`;
      const body = `${pr.title}\n_${detail}_`;
      return buildMapped(
        deliveryId,
        'pull_request',
        body,
        `#${String(pr.number)}`,
        pr.html_url,
        pr.updated_at,
      );
    }
    case 'workflow_run': {
      const parsed = z
        .object({
          action: z.string(),
          workflow_run: z.object({
            name: z.string(),
            head_branch: z.string(),
            conclusion: z.string().nullable().optional(),
            html_url: z.string(),
            updated_at: z.string().optional(),
            run_number: z.number().optional(),
          }),
        })
        .safeParse(payload);
      if (!parsed.success) {
        return null;
      }
      const { action, workflow_run: run } = parsed.data;
      if (action !== 'completed' || run.head_branch !== branch) {
        return null;
      }
      const conclusion = run.conclusion ?? 'unknown';
      const body = `${run.name}: **${conclusion}** on \`${run.head_branch}\``;
      const ref = run.run_number !== undefined ? `#${String(run.run_number)}` : run.head_branch;
      return buildMapped(deliveryId, 'ci', body, ref, run.html_url, run.updated_at);
    }
    case 'release': {
      const parsed = z
        .object({
          action: z.string(),
          release: z.object({
            name: z.string(),
            tag_name: z.string(),
            body: z.string().nullable().optional(),
            html_url: z.string(),
            published_at: z.string().nullable().optional(),
          }),
        })
        .safeParse(payload);
      if (!parsed.success || parsed.data.action !== 'published') {
        return null;
      }
      const { release } = parsed.data;
      const releaseBody = release.body?.trim();
      const body =
        releaseBody !== undefined && releaseBody.length > 0 ? releaseBody : release.name;
      return buildMapped(
        deliveryId,
        'release',
        body,
        release.tag_name,
        release.html_url,
        release.published_at ?? undefined,
      );
    }
    case 'issues': {
      const parsed = z
        .object({
          action: z.string(),
          issue: z.object({
            title: z.string(),
            html_url: z.string(),
            number: z.number(),
            updated_at: z.string().optional(),
          }),
        })
        .safeParse(payload);
      if (!parsed.success) {
        return null;
      }
      const { action, issue } = parsed.data;
      if (action !== 'opened' && action !== 'closed') {
        return null;
      }
      const body = `${issue.title}\n_${action} #${String(issue.number)}_`;
      return buildMapped(
        deliveryId,
        'issues',
        body,
        `#${String(issue.number)}`,
        issue.html_url,
        issue.updated_at,
      );
    }
    case 'deployment_status': {
      const parsed = z
        .object({
          deployment_status: z.object({
            state: z.string(),
            description: z.string().nullable().optional(),
            created_at: z.string().optional(),
          }),
          deployment: z.object({
            environment: z.string(),
            ref: z.string().optional(),
          }),
        })
        .safeParse(payload);
      if (!parsed.success) {
        return null;
      }
      const { deployment_status: status, deployment } = parsed.data;
      if (status.state !== 'success' && status.state !== 'failure') {
        return null;
      }
      const statusDescription = status.description?.trim();
      const body =
        statusDescription !== undefined && statusDescription.length > 0
          ? statusDescription
          : `Deployment to **${deployment.environment}**: ${status.state}`;
      const ref = deployment.ref ?? deployment.environment;
      return buildMapped(
        deliveryId,
        'deployment',
        body,
        ref,
        `${base}/deployments`,
        status.created_at,
      );
    }
    default:
      return null;
  }
}

function buildMapped(
  deliveryId: string,
  event: GithubInternalEvent,
  body: string,
  versionOrRef: string,
  githubUrl: string,
  timestampIso?: string,
): MappedGithubEvent {
  const label = GITHUB_EVENT_LABELS[event satisfies keyof GithubEvents];
  const mapped: MappedGithubEvent = {
    deliveryId,
    event,
    label,
    body,
    versionOrRef,
    timestamp: timestampIso !== undefined ? new Date(timestampIso) : new Date(),
    githubUrl,
  };
  return mapped;
}

export function mappedToAnnounceMeta(mapped: MappedGithubEvent): AnnounceMeta {
  const meta: AnnounceMeta = {
    kind: 'github',
    label: mapped.label,
    versionOrRef: mapped.versionOrRef,
    timestamp: mapped.timestamp,
    body: mapped.body,
    bodyIsLlmSummary: false,
    githubUrl: mapped.githubUrl,
  };
  if (mapped.thunderstoreUrl !== undefined) {
    meta.thunderstoreUrl = mapped.thunderstoreUrl;
  }
  return meta;
}
