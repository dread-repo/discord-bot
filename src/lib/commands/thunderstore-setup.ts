import type { ChatInputCommandInteraction } from 'discord.js';
import { ChannelType } from 'discord.js';

import { GuildConfigStore } from '../config/guild-config-store.js';
import {
  deferEphemeralCommand,
  editEphemeralContainer,
  editEphemeralError,
} from '../messages/container-message-builder.js';
import { PermissionResolver } from '../permissions/permission-resolver.js';

export async function executeThunderstoreSetup(
  interaction: ChatInputCommandInteraction,
  deps: {
    permissions?: PermissionResolver;
    guildConfig?: GuildConfigStore;
  } = {},
): Promise<void> {
  await deferEphemeralCommand(interaction);

  const permissions = deps.permissions ?? new PermissionResolver();
  const guildConfig = deps.guildConfig ?? new GuildConfigStore();

  const gate = await permissions.can(interaction, 'config');
  if (!gate.allowed) {
    await editEphemeralError(interaction, gate.reason);
    return;
  }

  const channel = interaction.options.getChannel('channel', true);
  const role = interaction.options.getRole('role', true);

  if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
    await editEphemeralError(interaction, 'Channel must be a text or announcement channel.');
    return;
  }

  const guildId = interaction.guildId;
  if (!guildId) return;
  await guildConfig.setThunderstoreConfig(guildId, channel.id, role.id);

  await editEphemeralContainer(
    interaction,
    `Thunderstore watcher configured.\nChannel: <#${channel.id}>\nPing role: <@&${role.id}>`,
  );
}
