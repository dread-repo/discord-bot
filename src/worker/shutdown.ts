import type { Server } from 'node:http';

import { disconnectPrisma } from '../lib/db/prisma.js';
import type { JobQueue } from '../lib/queue/job-queue.js';
import type { WorkerRegistry } from './register-processors.js';

function closeHttpServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err !== undefined) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function registerWorkerShutdown(hooks: {
  registry: WorkerRegistry;
  jobQueue: JobQueue;
  httpServer: Server;
}): void {
  const shutdown = async (): Promise<void> => {
    await closeHttpServer(hooks.httpServer);
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
