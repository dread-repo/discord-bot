import { PermissionFlagsBits } from 'discord.js';

import type { GuildConfigStore } from '../config/guild-config-store.js';
import { OFFICIAL_GUILD_ID } from '../constants.js';

export type PermissionAction =
  | 'config'
  | 'moderate'
  | 'globalPluginRegister'
  | 'setBotAdmin'
  | 'officialForumRegister';

export interface PermissionContext {
  guildId: string;
  userId: string;
  memberRoles: string[];
  discordPermissions: bigint;
}

export class PermissionResolver {
  constructor(private readonly guildConfig: GuildConfigStore) {}

  async can(action: PermissionAction, ctx: PermissionContext): Promise<boolean> {
    const perms = ctx.discordPermissions;
    const isAdmin = (perms & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator;
    const isBotAdmin = await this.guildConfig.isBotAdmin(ctx.guildId, ctx.userId);

    switch (action) {
      case 'moderate': {
        if (hasModerationPermission(perms)) {
          return true;
        }
        return isBotAdmin;
      }
      case 'config': {
        if (isAdmin || isBotAdmin) {
          return true;
        }
        return (perms & PermissionFlagsBits.ManageGuild) === PermissionFlagsBits.ManageGuild;
      }
      case 'setBotAdmin':
        return isAdmin;
      case 'globalPluginRegister':
      case 'officialForumRegister':
        return ctx.guildId === OFFICIAL_GUILD_ID && isAdmin;
      default: {
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  }
}

function hasModerationPermission(perms: bigint): boolean {
  const modFlags =
    PermissionFlagsBits.BanMembers |
    PermissionFlagsBits.KickMembers |
    PermissionFlagsBits.ModerateMembers;
  return (perms & modFlags) !== 0n;
}
