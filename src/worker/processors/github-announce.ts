import type { Job } from 'bullmq';
import type { MessageCreateOptions } from 'discord.js';

import { GuildConfigStore } from '../../lib/config/guild-config-store.js';
import type { GitHubEvents } from '../../lib/config/github-events.js';
import { sendChannelMessage } from '../../lib/discord/channel-sender.js';
import { WatcherDedupeStore } from '../../lib/dedupe/watcher-dedupe-store.js';
import { logger } from '../../lib/log.js';
import { buildAnnounceContainer } from '../../lib/messages/container-message-builder.js';
import { buildGitHubAnnounceMeta } from '../../lib/watchers/github-announce-meta.js';
import { shouldProcessGitHubWebhook } from '../../lib/watchers/github-webhook-payload.js';

export interface GitHubWatchJobData {
  deliveryId: string;
  event: keyof GitHubEvents;
  payload: unknown;
}

export async function processGitHubAnnounceJob(
  job: Job,
  deps: {
    guildConfig?: GuildConfigStore;
    dedupe?: WatcherDedupeStore;
  } = {},
): Promise<void> {
  const data = job.data as GitHubWatchJobData;
  const { deliveryId, event, payload } = data;
  const guildConfig = deps.guildConfig ?? new GuildConfigStore();
  const dedupe = deps.dedupe ?? new WatcherDedupeStore();

  if (!shouldProcessGitHubWebhook(event, payload)) {
    logger.info('GitHub webhook skipped by event filter', {
      deliveryId,
      event,
      jobId: job.id,
    });
    return;
  }

  const meta = buildGitHubAnnounceMeta(event, payload);
  if (!meta) {
    logger.warn('GitHub webhook missing announce metadata', { deliveryId, event });
    return;
  }

  const claimed = await dedupe.tryClaim(`gh:${deliveryId}`);
  if (!claimed) {
    logger.info('GitHub delivery deduped', { deliveryId, event });
    return;
  }

  const message = buildAnnounceContainer(meta);
  const guilds = await guildConfig.listGitHubGuilds();
  let posted = 0;

  for (const guild of guilds) {
    if (!guild.events[event]) continue;
    try {
      await sendChannelMessage(guild.channelId, message as MessageCreateOptions);
      posted += 1;
      logger.info('GitHub announce posted', {
        deliveryId,
        event,
        guildId: guild.guildId,
        channelId: guild.channelId,
        repo: meta.versionOrRef,
      });
    } catch (err) {
      logger.error('GitHub announce post failed', {
        deliveryId,
        guildId: guild.guildId,
        channelId: guild.channelId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (posted === 0) {
    logger.warn('GitHub delivery matched but no guild had event enabled', {
      deliveryId,
      event,
      guildCount: guilds.length,
    });
  }
}
