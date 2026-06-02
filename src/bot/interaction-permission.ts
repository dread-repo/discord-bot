import type { ChatInputCommandInteraction } from 'discord.js';

import type { PermissionContext } from '../lib/permissions/permission-resolver.js';

export function getPermissionContext(
  interaction: ChatInputCommandInteraction,
): PermissionContext | null {
  const { guildId, memberPermissions } = interaction;
  if (guildId === null || memberPermissions === null) {
    return null;
  }

  return {
    guildId,
    userId: interaction.user.id,
    memberRoles: memberRoleIds(interaction),
    discordPermissions: memberPermissions.bitfield,
  };
}

function memberRoleIds(interaction: ChatInputCommandInteraction): string[] {
  const member = interaction.member;
  if (member === null) {
    return [];
  }
  if ('roles' in member && Array.isArray(member.roles)) {
    return member.roles;
  }
  if ('roles' in member && 'cache' in member.roles) {
    return [...member.roles.cache.keys()];
  }
  return [];
}
