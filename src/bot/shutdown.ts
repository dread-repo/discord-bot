import type { Client } from 'discord.js';

import { disconnectPrisma } from '../lib/db/prisma.js';
import type { JobQueue } from '../lib/queue/job-queue.js';

export function registerBotShutdown(hooks: { client: Client; jobQueue?: JobQueue }): void {
  const shutdown = async (): Promise<void> => {
    void hooks.client.destroy();
    if (hooks.jobQueue !== undefined) {
      await hooks.jobQueue.close();
    }
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
