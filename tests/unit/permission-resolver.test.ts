import { describe, expect, it, vi } from 'vitest';
import type { GuildMember, Interaction } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

import type { GuildConfigStore } from '../../src/lib/config/guild-config-store.js';
import { OFFICIAL_GUILD_ID } from '../../src/lib/constants.js';
import { PermissionResolver } from '../../src/lib/permissions/permission-resolver.js';

function mockInteraction(opts: {
  guildId: string;
  userId: string;
  isAdmin?: boolean;
  inGuild?: boolean;
}): Interaction {
  const bitfield = opts.isAdmin ? PermissionFlagsBits.Administrator : 0n;
  const member = {
    permissions: {
      has: (flag: bigint | string) =>
        typeof flag === 'string'
          ? flag === 'Administrator' && opts.isAdmin === true
          : (bitfield & flag) === flag,
    },
  } as unknown as GuildMember;

  return {
    inGuild: () => opts.inGuild !== false,
    guildId: opts.guildId,
    user: { id: opts.userId },
    member,
  } as Interaction;
}

describe('PermissionResolver', () => {
  it('allows Discord Administrator for setBotAdmin', async () => {
    const store = {
      isBotAdmin: vi.fn().mockResolvedValue(false),
    } as unknown as GuildConfigStore;
    const resolver = new PermissionResolver(store);
    const interaction = mockInteraction({
      guildId: '111',
      userId: 'u1',
      isAdmin: true,
    });

    const result = await resolver.can(interaction, 'setBotAdmin');
    expect(result).toEqual({ allowed: true });
  });

  it('denies global admin for moderate in non-official guild', async () => {
    const store = {
      isBotAdmin: vi.fn((guildId: string, userId: string) =>
        Promise.resolve(guildId === OFFICIAL_GUILD_ID && userId === 'global-admin'),
      ),
    } as unknown as GuildConfigStore;
    const resolver = new PermissionResolver(store);
    const interaction = mockInteraction({
      guildId: '999',
      userId: 'global-admin',
      isAdmin: false,
    });

    const moderate = await resolver.can(interaction, 'moderate');
    expect(moderate.allowed).toBe(false);

    const config = await resolver.can(interaction, 'config');
    expect(config.allowed).toBe(true);
  });

  it('requires official guild for globalPluginRegister', async () => {
    const store = {
      isBotAdmin: vi.fn().mockResolvedValue(true),
    } as unknown as GuildConfigStore;
    const resolver = new PermissionResolver(store);

    const wrongGuild = mockInteraction({ guildId: '999', userId: 'u1' });
    expect(await resolver.can(wrongGuild, 'globalPluginRegister')).toEqual({
      allowed: false,
      reason: 'Global plugin registration is only allowed in the official Dread server.',
    });

    const official = mockInteraction({ guildId: OFFICIAL_GUILD_ID, userId: 'u1' });
    expect(await resolver.can(official, 'globalPluginRegister')).toEqual({ allowed: true });
  });
});
