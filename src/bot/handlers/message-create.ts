import { Events, type Client } from 'discord.js';

import { loadEnv } from '../../lib/env.js';
import { logger } from '../../lib/log.js';
import { QUEUE_NAMES, JobQueue } from '../../lib/queue/job-queue.js';

export function registerMessageHandler(client: Client, queue = new JobQueue()): void {
  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot || !message.guildId) return;

    const probability = loadEnv().DREAD_REPLY_PROBABILITY;
    if (Math.random() > probability) return;

    void queue
      .add(QUEUE_NAMES.dreadReply, 'candidate', {
        guildId: message.guildId,
        channelId: message.channelId,
        messageId: message.id,
        content: message.content,
      })
      .catch((err: unknown) => {
        logger.warn('Failed to enqueue dread reply job', {
          error: err instanceof Error ? err.message : String(err),
        });
      });
  });
}
