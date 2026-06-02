import { loadEnv } from '../lib/env.js';
import { logger } from '../lib/log.js';
import { registerProcessors } from './processors/register-processors.js';
import { startWebhookServer } from './http.js';

export function startWorker(): void {
  const env = loadEnv();
  registerProcessors();
  startWebhookServer(env.WEBHOOK_PORT);
  logger.info('Worker started');
}

