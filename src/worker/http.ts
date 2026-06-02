import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import type { GitHubEvents } from '../lib/config/github-events.js';
import { isWatchedGitHubRepository } from '../lib/constants.js';
import { loadEnv } from '../lib/env.js';
import { logger } from '../lib/log.js';
import { QUEUE_NAMES, JobQueue } from '../lib/queue/job-queue.js';

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

function verifySignature(secret: string, body: Buffer, signatureHeader: string | undefined): boolean {
  if (!signatureHeader?.startsWith('sha256=')) return false;
  const digest = createHmac('sha256', secret).update(body).digest('hex');
  const expected = `sha256=${digest}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}

type GitHubEventKey = keyof GitHubEvents;

function mapEvent(githubEvent: string): GitHubEventKey | null {
  switch (githubEvent) {
    case 'push':
      return 'push';
    case 'pull_request':
      return 'pull_request';
    case 'workflow_run':
      return 'ci';
    case 'release':
      return 'release';
    case 'issues':
      return 'issues';
    case 'deployment_status':
      return 'deployment';
    default:
      return null;
  }
}

export function createWebhookServer(queue = new JobQueue()): ReturnType<typeof createServer> {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    void handleRequest(req, res, queue);
  });
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  queue: JobQueue,
): Promise<void> {
  if (req.method !== 'POST' || req.url !== '/webhooks/github') {
    res.writeHead(404);
    res.end();
    return;
  }

  const body = await readBody(req);
  const env = loadEnv();
  const secret = env.GITHUB_WEBHOOK_SECRET;

  if (secret) {
    const sig = req.headers['x-hub-signature-256'];
    const sigStr = Array.isArray(sig) ? sig[0] : sig;
    if (!verifySignature(secret, body, sigStr)) {
      res.writeHead(401);
      res.end();
      return;
    }
  }

  const eventHeader = req.headers['x-github-event'];
  const deliveryHeader = req.headers['x-github-delivery'];
  const githubEvent = Array.isArray(eventHeader) ? eventHeader[0] : eventHeader;
  const deliveryId = Array.isArray(deliveryHeader) ? deliveryHeader[0] : deliveryHeader;

  if (!githubEvent || !deliveryId) {
    res.writeHead(400);
    res.end();
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body.toString('utf8')) as unknown;
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }

  const repoName =
    typeof payload === 'object' &&
    payload !== null &&
    'repository' in payload &&
    typeof (payload as { repository?: { full_name?: string } }).repository?.full_name === 'string'
      ? (payload as { repository: { full_name: string } }).repository.full_name
      : null;

  if (!repoName || !isWatchedGitHubRepository(repoName)) {
    res.writeHead(404);
    res.end();
    return;
  }

  const internalEvent = mapEvent(githubEvent);
  if (!internalEvent) {
    res.writeHead(200);
    res.end('ignored');
    return;
  }

  await queue.add(QUEUE_NAMES.github, internalEvent, {
    deliveryId,
    event: internalEvent,
    payload,
  });

  logger.info('GitHub webhook enqueued', {
    deliveryId,
    event: internalEvent,
    repo: repoName,
  });
  res.writeHead(200);
  res.end('ok');
}

export function startWebhookServer(port: number, queue = new JobQueue()): ReturnType<typeof createServer> {
  const server = createWebhookServer(queue);
  server.listen(port, () => {
    logger.info('GitHub webhook server listening', { port });
  });
  return server;
}
