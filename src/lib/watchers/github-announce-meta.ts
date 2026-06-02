import type { GitHubEvents } from '../config/github-events.js';
import type { AnnounceMeta } from '../messages/container-message-builder.js';
import { asRecord, getNumber, getString } from './github-payload-utils.js';
import { getRepository } from './github-webhook-payload.js';

function shortSha(sha: string | undefined): string {
  return sha && sha.length >= 7 ? sha.slice(0, 7) : 'unknown';
}

export function buildGitHubAnnounceMeta(
  event: keyof GitHubEvents,
  payload: unknown,
): AnnounceMeta | null {
  const root = asRecord(payload);
  const repo = getRepository(payload);
  if (!root || !repo) return null;

  const now = new Date();

  switch (event) {
    case 'push': {
      const head = asRecord(root['head_commit']);
      const message = head ? getString(head, 'message')?.split('\n')[0] : undefined;
      const url = head ? getString(head, 'url') : repo.html_url;
      return {
        kind: 'github',
        label: 'push',
        versionOrRef: shortSha(head ? getString(head, 'id') : undefined),
        timestamp: now,
        body: message ?? 'Push to default branch',
        bodyIsLlmSummary: false,
        githubUrl: url,
      };
    }
    case 'pull_request': {
      const pr = asRecord(root['pull_request']);
      const title = pr ? getString(pr, 'title') : undefined;
      const url = pr ? getString(pr, 'html_url') : undefined;
      const action = getString(root, 'action') ?? 'updated';
      const number = pr ? getNumber(pr, 'number') : undefined;
      return {
        kind: 'github',
        label: 'pull_request',
        versionOrRef: `#${number ?? '?'}`,
        timestamp: now,
        body: `${action}: ${title ?? 'Pull request update'}`,
        bodyIsLlmSummary: false,
        githubUrl: url,
      };
    }
    case 'ci': {
      const run = asRecord(root['workflow_run']);
      const name = run ? getString(run, 'name') : undefined;
      const conclusion = run ? getString(run, 'conclusion') : undefined;
      const url = run ? getString(run, 'html_url') : undefined;
      return {
        kind: 'github',
        label: 'ci',
        versionOrRef: conclusion ?? 'unknown',
        timestamp: now,
        body: `${name ?? 'Workflow'} — ${conclusion ?? 'unknown'}`,
        bodyIsLlmSummary: false,
        githubUrl: url,
      };
    }
    case 'release': {
      const release = asRecord(root['release']);
      const tag = release ? getString(release, 'tag_name') : undefined;
      const bodyText = release ? getString(release, 'body') : undefined;
      const url = release ? getString(release, 'html_url') : undefined;
      return {
        kind: 'github',
        label: 'release',
        versionOrRef: tag ?? 'release',
        timestamp: now,
        body: bodyText && bodyText.length > 0 ? bodyText : 'New release published',
        bodyIsLlmSummary: false,
        githubUrl: url,
      };
    }
    case 'issues': {
      const issue = asRecord(root['issue']);
      const title = issue ? getString(issue, 'title') : undefined;
      const url = issue ? getString(issue, 'html_url') : undefined;
      const action = getString(root, 'action') ?? 'updated';
      const number = issue ? getNumber(issue, 'number') : undefined;
      return {
        kind: 'github',
        label: 'issues',
        versionOrRef: `#${number ?? '?'}`,
        timestamp: now,
        body: `${action}: ${title ?? 'Issue update'}`,
        bodyIsLlmSummary: false,
        githubUrl: url,
      };
    }
    case 'deployment': {
      const dep = asRecord(root['deployment']);
      const status = asRecord(root['deployment_status']);
      const env = dep ? getString(dep, 'environment') : undefined;
      const state = status ? getString(status, 'state') : undefined;
      const targetUrl = status ? getString(status, 'target_url') : undefined;
      const depUrl = dep ? getString(dep, 'url') : undefined;
      return {
        kind: 'github',
        label: 'deployment',
        versionOrRef: env ?? 'deployment',
        timestamp: now,
        body: `Deployment ${state ?? 'updated'}`,
        bodyIsLlmSummary: false,
        githubUrl: targetUrl ?? depUrl,
      };
    }
    default:
      return null;
  }
}
