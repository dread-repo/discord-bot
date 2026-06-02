import { PermissionFlagsBits } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';

import type { GuildConfigStore } from '../config/guild-config-store.js';
import { OFFICIAL_GUILD_ID } from '../constants.js';
import { PermissionResolver } from './permission-resolver.js';

function ctx(guildId: string, perms: bigint) {
  return {
    guildId,
    userId: 'user-1',
    memberRoles: [],
    discordPermissions: perms,
  };
}

describe('PermissionResolver', () => {
  it('allows local mod to moderate in same guild', async () => {
    const store = { isBotAdmin: vi.fn().mockResolvedValue(false) } as unknown as GuildConfigStore;
    const resolver = new PermissionResolver(store);
    const allowed = await resolver.can(
      'moderate',
      ctx('guild-a', PermissionFlagsBits.BanMembers),
    );
    expect(allowed).toBe(true);
  });

  it('denies official-guild bot-admin moderate abroad without local rights', async () => {
    const store = {
      isBotAdmin: vi.fn((guildId: string) => Promise.resolve(guildId === OFFICIAL_GUILD_ID)),
    } as unknown as GuildConfigStore;
    const resolver = new PermissionResolver(store);
    const allowed = await resolver.can('moderate', ctx('guild-b', 0n));
    expect(allowed).toBe(false);
  });

  it('denies setBotAdmin for non-administrator', async () => {
    const store = { isBotAdmin: vi.fn().mockResolvedValue(false) } as unknown as GuildConfigStore;
    const resolver = new PermissionResolver(store);
    const allowed = await resolver.can('setBotAdmin', ctx('guild-a', 0n));
    expect(allowed).toBe(false);
  });
});
