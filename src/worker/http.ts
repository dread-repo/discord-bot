import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { GITHUB_REPO } from '../lib/constants.js';
import type { WorkerEnv } from '../lib/env.js';
import { logInfo } from '../lib/log.js';
import type { JobQueue } from '../lib/queue/job-queue.js';
import { mapGithubWebhook } from '../lib/watchers/github-event-mapper.js';
import { verifyGithubWebhookSignature } from '../lib/watchers/github-webhook-verify.js';

const MAX_BODY_BYTES = 1_048_576;

export interface WebhookHttpOptions {
  env: WorkerEnv;
  jobQueue: JobQueue;
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error('body_too_large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function repositoryFullName(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }
  const repository = (payload as { repository?: { full_name?: string } }).repository;
  return repository?.full_name ?? null;
}

export function startWebhookHttpServer(options: WebhookHttpOptions): Server {
  const { env, jobQueue } = options;
  const port = env.WEBHOOK_PORT;

  const server = createServer((req, res) => {
    void handleRequest(req, res, env, jobQueue);
  });

  server.listen(port, () => {
    logInfo(`[worker] webhook HTTP listening on port ${String(port)}`);
  });

  return server;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: WorkerEnv,
  jobQueue: JobQueue,
): Promise<void> {
  const url = req.url ?? '/';

  if (req.method === 'GET' && url === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== 'POST' || url !== '/webhooks/github') {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end();
      return;
    }
    res.statusCode = 404;
    res.end();
    return;
  }

  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'body_too_large') {
      res.statusCode = 413;
      res.end();
      return;
    }
    res.statusCode = 500;
    res.end();
    return;
  }

  const signature = req.headers['x-hub-signature-256'];
  const signatureHeader = Array.isArray(signature) ? signature[0] : signature;
  if (
    !verifyGithubWebhookSignature(rawBody, signatureHeader, env.GITHUB_WEBHOOK_SECRET)
  ) {
    res.statusCode = 401;
    res.end();
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString('utf8')) as unknown;
  } catch {
    res.statusCode = 400;
    res.end();
    return;
  }

  const fullName = repositoryFullName(payload);
  if (fullName !== GITHUB_REPO) {
    res.statusCode = 404;
    res.end();
    return;
  }

  const githubEventHeader = req.headers['x-github-event'];
  const githubEvent = Array.isArray(githubEventHeader) ? githubEventHeader[0] : githubEventHeader;
  const deliveryHeader = req.headers['x-github-delivery'];
  const deliveryId = Array.isArray(deliveryHeader) ? deliveryHeader[0] : deliveryHeader;

  if (githubEvent === undefined || deliveryId === undefined) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const mapped = mapGithubWebhook(githubEvent, payload, deliveryId);
  if (mapped !== null) {
    await jobQueue.enqueue('watcher:github', mapped.event, {
      deliveryId,
      event: mapped.event,
      mapped,
    });
    logInfo(`[worker] github webhook enqueued ${mapped.event} delivery=${deliveryId}`);
  }

  res.statusCode = 200;
  res.end();
}
