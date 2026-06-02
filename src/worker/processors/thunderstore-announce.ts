import type { Job } from 'bullmq';
import type { MessageCreateOptions } from 'discord.js';

import { GuildConfigStore } from '../../lib/config/guild-config-store.js';
import { MAX_ANNOUNCE_BODY_CHARS } from '../../lib/constants.js';
import { sendChannelMessage } from '../../lib/discord/channel-sender.js';
import { logger } from '../../lib/log.js';
import { buildAnnounceContainer } from '../../lib/messages/container-message-builder.js';
import type { ThunderstoreAnnounceJobData } from '../../lib/watchers/thunderstore-watcher.js';

function githubUrlForPackage(
  githubRepo: string | null,
  version: string,
  websiteUrl?: string,
): string | undefined {
  if (websiteUrl?.includes('github.com')) return websiteUrl;
  if (!githubRepo) return undefined;
  return `https://github.com/${githubRepo}/releases/tag/v${version}`;
}

export async function processThunderstoreAnnounceJob(
  job: Job,
  deps: { guildConfig?: GuildConfigStore } = {},
): Promise<void> {
  const data = job.data as ThunderstoreAnnounceJobData;
  const guildConfig = deps.guildConfig ?? new GuildConfigStore();
  const guilds = await guildConfig.listThunderstoreGuilds();

  if (guilds.length === 0) {
    logger.warn('Thunderstore announce: no guilds configured');
    return;
  }

  const body =
    data.description.length > MAX_ANNOUNCE_BODY_CHARS
      ? data.description.slice(0, MAX_ANNOUNCE_BODY_CHARS)
      : data.description || `Version ${data.version} published.`;

  const meta = {
    kind: 'thunderstore' as const,
    label: data.isCore ? 'core' : `plugin: ${data.name}`,
    versionOrRef: data.version,
    timestamp: new Date(data.dateCreatedIso),
    body,
    bodyIsLlmSummary: data.description.length > MAX_ANNOUNCE_BODY_CHARS,
    thunderstoreUrl: data.thunderstoreUrl,
    githubUrl: githubUrlForPackage(data.githubRepo, data.version, data.websiteUrl),
  };

  const container = buildAnnounceContainer(meta);
  let posted = 0;

  for (const guild of guilds) {
    try {
      const payload: MessageCreateOptions = {
        content: `<@&${guild.pingRoleId}>`,
        ...(container as MessageCreateOptions),
      };
      await sendChannelMessage(guild.channelId, payload);
      posted += 1;
      logger.info('Thunderstore announce posted', {
        guildId: guild.guildId,
        channelId: guild.channelId,
        package: `${data.namespace}/${data.name}`,
        version: data.version,
      });
    } catch (err) {
      logger.error('Thunderstore announce post failed', {
        guildId: guild.guildId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (posted === 0) {
    logger.warn('Thunderstore announce: failed to post to any guild', {
      package: `${data.namespace}/${data.name}`,
      version: data.version,
    });
  }
}
