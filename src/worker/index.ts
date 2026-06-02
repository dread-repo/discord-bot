import { loadEnv } from '../lib/env.js';
import { logger } from '../lib/log.js';
import { scheduleThunderstorePoll } from '../lib/watchers/thunderstore-watcher.js';
import { registerProcessors } from './processors/register-processors.js';
import { startWebhookServer } from './http.js';

export function startWorker(): void {
  const env = loadEnv();
  const queue = registerProcessors();
  scheduleThunderstorePoll(queue);
  startWebhookServer(env.WEBHOOK_PORT, queue);
  logger.info('Worker started');
}

