import type { ChatInputCommandInteraction } from 'discord.js';
import { ChannelType, MessageFlags } from 'discord.js';

import { GuildConfigStore } from '../config/guild-config-store.js';
import { type GitHubEvents } from '../config/github-events.js';
import { buildEphemeralError, buildSimpleContainer } from '../messages/container-message-builder.js';
import { PermissionResolver } from '../permissions/permission-resolver.js';

export async function executeGitHubSetup(
  interaction: ChatInputCommandInteraction,
  deps: {
    permissions?: PermissionResolver;
    guildConfig?: GuildConfigStore;
  } = {},
): Promise<void> {
  const permissions = deps.permissions ?? new PermissionResolver();
  const guildConfig = deps.guildConfig ?? new GuildConfigStore();

  const gate = await permissions.can(interaction, 'config');
  if (!gate.allowed) {
    await interaction.reply(buildEphemeralError(gate.reason));
    return;
  }

  const channel = interaction.options.getChannel('channel', true);
  if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
    await interaction.reply(buildEphemeralError('Channel must be a text or announcement channel.'));
    return;
  }

  const events: GitHubEvents = {
    push: interaction.options.getBoolean('push') ?? false,
    pull_request: interaction.options.getBoolean('pr') ?? false,
    ci: interaction.options.getBoolean('ci') ?? false,
    release: interaction.options.getBoolean('release') ?? false,
    issues: interaction.options.getBoolean('issues') ?? false,
    deployment: interaction.options.getBoolean('deployment') ?? false,
  };

  const guildId = interaction.guildId;
  if (!guildId) return;
  await guildConfig.setGitHubConfig(guildId, channel.id, events);

  const enabled = Object.entries(events)
    .filter(([, on]) => on)
    .map(([k]) => k)
    .join(', ');

  const container = buildSimpleContainer(
    `GitHub watcher configured.\nChannel: <#${channel.id}>\nEvents: ${enabled || 'none (enable at least one)'}`,
  );
  await interaction.reply({
    ...container,
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });
}
