import type { GitHubEvents } from '../config/github-events.js';
import { asRecord, getString } from './github-payload-utils.js';

export interface RepoPayload {
  full_name: string;
  default_branch: string;
  html_url?: string;
}

export function getRepository(payload: unknown): RepoPayload | null {
  const root = asRecord(payload);
  const repo = root ? asRecord(root['repository']) : null;
  if (!repo) return null;
  const full_name = getString(repo, 'full_name');
  if (!full_name) return null;
  const default_branch = getString(repo, 'default_branch') ?? 'main';
  const html_url = getString(repo, 'html_url');
  return html_url ? { full_name, default_branch, html_url } : { full_name, default_branch };
}

function defaultBranchRef(payload: unknown): string {
  const branch = getRepository(payload)?.default_branch ?? 'main';
  return `refs/heads/${branch}`;
}

/** Whether this delivery should produce an announcement (per github-webhook contract). */
export function shouldProcessGitHubWebhook(event: keyof GitHubEvents, payload: unknown): boolean {
  const root = asRecord(payload);
  if (!root) return false;

  switch (event) {
    case 'push': {
      const ref = getString(root, 'ref');
      return ref === defaultBranchRef(payload);
    }
    case 'pull_request': {
      const action = getString(root, 'action');
      return action === 'opened' || action === 'closed' || action === 'merged';
    }
    case 'ci': {
      const action = getString(root, 'action');
      if (action !== 'completed') return false;
      const run = asRecord(root['workflow_run']);
      const branch = run ? getString(run, 'head_branch') : undefined;
      const repo = getRepository(payload);
      return branch === (repo?.default_branch ?? 'main');
    }
    case 'release': {
      return getString(root, 'action') === 'published';
    }
    case 'issues': {
      const action = getString(root, 'action');
      return action === 'opened' || action === 'closed';
    }
    case 'deployment': {
      const status = asRecord(root['deployment_status']);
      const state = status ? getString(status, 'state') : undefined;
      return state === 'success' || state === 'failure' || state === 'error';
    }
    default:
      return false;
  }
}
