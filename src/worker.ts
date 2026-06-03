import { loadEnvFile } from './lib/load-env-file.js';
import { loadWorkerEnv } from './lib/env.js';
import { logError, logInfo } from './lib/log.js';
import { JobQueue, verifyRedisConnection } from './lib/queue/job-queue.js';
import { createGithubWorkerDeps } from './worker/github-deps.js';
import { startWebhookHttpServer } from './worker/http.js';
import { registerProcessors } from './worker/register-processors.js';
import { scheduleThunderstorePoll } from './worker/schedule/thunderstore-poll.js';
import { createThunderstoreWorkerDeps } from './worker/thunderstore-deps.js';
import { registerWorkerShutdown } from './worker/shutdown.js';

export async function runWorker(): Promise<void> {
  loadEnvFile();
  const env = loadWorkerEnv();

  try {
    await verifyRedisConnection(env.REDIS_URL);
  } catch (err: unknown) {
    logError('[worker] Redis unreachable at startup', err);
    process.exit(1);
  }

  const jobQueue = new JobQueue(env.REDIS_URL);
  const thunderstoreDeps = createThunderstoreWorkerDeps(env, jobQueue);
  const githubDeps = createGithubWorkerDeps(env, jobQueue);
  const registry = registerProcessors(
    jobQueue.getConnectionOptions(),
    thunderstoreDeps,
    githubDeps,
  );
  const httpServer = startWebhookHttpServer({ env, jobQueue });
  registerWorkerShutdown({ registry, jobQueue, httpServer });
  scheduleThunderstorePoll(jobQueue, env.THUNDERSTORE_POLL_INTERVAL_MS ?? 600_000);

  logInfo('[worker] consumers registered; waiting for jobs');
}

runWorker().catch((err: unknown) => {
  logError('[worker] fatal startup error', err);
  process.exit(1);
});
