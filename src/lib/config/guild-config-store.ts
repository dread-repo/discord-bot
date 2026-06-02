import type { GuildConfig, PrismaClient } from '@prisma/client';

import { getPrisma } from '../db/prisma.js';

export interface UpsertGuildConfig {
  guildId: string;
  botAdminRoleId?: string | null;
  dreadReplyChannelIds?: string[];
}

export class GuildConfigStore {
  constructor(private readonly db: PrismaClient = getPrisma()) {}

  async getGuild(guildId: string): Promise<GuildConfig | null> {
    return this.db.guildConfig.findUnique({ where: { guildId } });
  }

  async upsertGuild(data: UpsertGuildConfig): Promise<GuildConfig> {
    return this.db.guildConfig.upsert({
      where: { guildId: data.guildId },
      create: {
        guildId: data.guildId,
        botAdminRoleId: data.botAdminRoleId ?? null,
        dreadReplyChannelIds: data.dreadReplyChannelIds ?? [],
      },
      update: {
        ...(data.botAdminRoleId !== undefined ? { botAdminRoleId: data.botAdminRoleId } : {}),
        ...(data.dreadReplyChannelIds !== undefined
          ? { dreadReplyChannelIds: data.dreadReplyChannelIds }
          : {}),
      },
    });
  }

  async isBotAdmin(guildId: string, userId: string): Promise<boolean> {
    const row = await this.db.guildBotAdmin.findUnique({
      where: { guildId_userId: { guildId, userId } },
    });
    return row !== null;
  }

  async grantBotAdmin(guildId: string, userId: string): Promise<void> {
    await this.db.guildConfig.upsert({
      where: { guildId },
      create: { guildId },
      update: {},
    });
    await this.db.guildBotAdmin.upsert({
      where: { guildId_userId: { guildId, userId } },
      create: { guildId, userId },
      update: {},
    });
  }

  async revokeBotAdmin(guildId: string, userId: string): Promise<void> {
    await this.db.guildBotAdmin.deleteMany({ where: { guildId, userId } });
  }
}
