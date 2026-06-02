import { loadWorkerEnv } from './lib/env.js';
import { logError, logInfo } from './lib/log.js';
import { JobQueue, verifyRedisConnection } from './lib/queue/job-queue.js';
import { registerProcessors } from './worker/register-processors.js';
import { registerWorkerShutdown } from './worker/shutdown.js';

export async function runWorker(): Promise<void> {
  const env = loadWorkerEnv();

  try {
    await verifyRedisConnection(env.REDIS_URL);
  } catch (err: unknown) {
    logError('[worker] Redis unreachable at startup', err);
    process.exit(1);
  }

  const jobQueue = new JobQueue(env.REDIS_URL);
  const registry = registerProcessors(jobQueue.getConnectionOptions());
  registerWorkerShutdown({ registry, jobQueue });

  logInfo('[worker] consumers registered; waiting for jobs');
}

runWorker().catch((err: unknown) => {
  logError('[worker] fatal startup error', err);
  process.exit(1);
});
