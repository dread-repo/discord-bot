import type { Client } from 'discord.js';
import { Events } from 'discord.js';

import type { JobQueue } from '../../lib/queue/job-queue.js';
import { InteractionRouter } from '../interaction-router.js';
import { createPlatformSmokeHandler } from './platform-smoke.js';

export function wireInteractionRouter(client: Client, jobQueue: JobQueue): InteractionRouter {
  const router = new InteractionRouter();
  router.register('platform-smoke', createPlatformSmokeHandler(jobQueue));

  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    void router.dispatch(interaction);
  });

  return router;
}
