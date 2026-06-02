import { disconnectPrisma } from '../lib/db/prisma.js';
import type { JobQueue } from '../lib/queue/job-queue.js';
import type { WorkerRegistry } from './register-processors.js';

export function registerWorkerShutdown(hooks: {
  registry: WorkerRegistry;
  jobQueue: JobQueue;
}): void {
  const shutdown = async (): Promise<void> => {
    await hooks.registry.close();
    await hooks.jobQueue.close();
    await disconnectPrisma();
    process.exit(0);
  };

  process.once('SIGINT', () => {
    void shutdown();
  });
  process.once('SIGTERM', () => {
    void shutdown();
  });
}
