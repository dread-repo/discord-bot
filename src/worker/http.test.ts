import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import type { WorkerEnv } from '../lib/env.js';
import type { JobQueue } from '../lib/queue/job-queue.js';
import { startWebhookHttpServer } from './http.js';

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../lib/watchers/fixtures/github',
);

function sign(body: Buffer, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('webhook HTTP', () => {
  it('enqueues watcher:github for valid signed push', async () => {
    const enqueue = vi.fn().mockResolvedValue('job-1');
    const jobQueue = { enqueue } as unknown as JobQueue;
    const env = {
      WEBHOOK_PORT: 0,
      GITHUB_WEBHOOK_SECRET: 'test-secret',
    } as WorkerEnv;

    const server = startWebhookHttpServer({ env, jobQueue });
    await new Promise<void>((resolve) => {
      server.on('listening', () => {
        resolve();
      });
    });
    const address = server.address();
    if (address === null || typeof address === 'string') {
      throw new Error('expected bound port');
    }

    const raw = readFileSync(join(fixturesDir, 'push-master.json'));
    const port = address.port;

    try {
      const response = await fetch(`http://127.0.0.1:${String(port)}/webhooks/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Event': 'push',
          'X-GitHub-Delivery': 'http-test-delivery',
          'X-Hub-Signature-256': sign(raw, 'test-secret'),
        },
        body: raw,
      });
      expect(response.status).toBe(200);
      expect(enqueue).toHaveBeenCalledWith(
        'watcher:github',
        'push',
        expect.objectContaining({ deliveryId: 'http-test-delivery', event: 'push' }),
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err !== undefined) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }
  });
});
