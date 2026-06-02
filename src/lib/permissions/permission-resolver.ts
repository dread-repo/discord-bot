import type { GuildMember, Interaction } from 'discord.js';

import { OFFICIAL_GUILD_ID } from '../constants.js';
import { GuildConfigStore } from '../config/guild-config-store.js';

export type PermissionAction =
  | 'config'
  | 'moderate'
  | 'globalPluginRegister'
  | 'setBotAdmin'
  | 'officialForumRegister';

export type PermissionResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export class PermissionResolver {
  constructor(private readonly guildConfig = new GuildConfigStore()) {}

  async can(interaction: Interaction, action: PermissionAction): Promise<PermissionResult> {
    if (!interaction.inGuild() || !interaction.guildId) {
      return { allowed: false, reason: 'This command can only be used in a server.' };
    }

    const member = interaction.member;
    if (!('permissions' in member) || typeof member.permissions === 'string') {
      return { allowed: false, reason: 'Could not resolve your server membership.' };
    }

    const guildMember = member as GuildMember;
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const isDiscordAdmin = guildMember.permissions.has('Administrator');
    const isBotAdmin = await this.guildConfig.isBotAdmin(guildId, userId);
    const isGlobalAdmin =
      guildId !== OFFICIAL_GUILD_ID &&
      (await this.guildConfig.isBotAdmin(OFFICIAL_GUILD_ID, userId));

    switch (action) {
      case 'config':
      case 'officialForumRegister':
        if (isDiscordAdmin || isBotAdmin || isGlobalAdmin) return { allowed: true };
        return { allowed: false, reason: 'You need Administrator or bot-admin for this server.' };

      case 'globalPluginRegister':
        if (guildId !== OFFICIAL_GUILD_ID) {
          return { allowed: false, reason: 'Global plugin registration is only allowed in the official Dread server.' };
        }
        if (isDiscordAdmin || isBotAdmin) return { allowed: true };
        return { allowed: false, reason: 'You need Administrator or bot-admin in the official server.' };

      case 'moderate':
        if (isDiscordAdmin || isBotAdmin) return { allowed: true };
        return { allowed: false, reason: 'You need Administrator or bot-admin in this server to moderate.' };

      case 'setBotAdmin':
        if (isDiscordAdmin) return { allowed: true };
        return { allowed: false, reason: 'Only Discord Administrators can grant bot-admin.' };

      default:
        return { allowed: false, reason: 'Unknown permission action.' };
    }
  }
}
