import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

import type { JobQueue } from '../../lib/queue/job-queue.js';
import { buildAnnounceContainer } from '../../lib/messages/container-message-builder.js';

export function createPlatformSmokeHandler(jobQueue: JobQueue) {
  return async function handlePlatformSmoke(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const meta = {
      kind: 'thunderstore' as const,
      label: 'core',
      versionOrRef: 'smoke',
      timestamp: new Date(),
      body: 'Platform smoke test.',
      bodyIsLlmSummary: false,
      thunderstoreUrl: 'https://thunderstore.io',
    };

    await jobQueue.enqueue('llm:dread-reply', 'smoke', {
      guildId: interaction.guildId ?? '0',
      channelId: interaction.channelId,
      messageId: interaction.id,
      content: 'smoke',
    });

    const payload = buildAnnounceContainer(meta);
    await interaction.editReply({
      embeds: payload.embeds ?? [],
      components: payload.components ?? [],
    });
  };
}
