import type {
  GuildConfig,
  GuildGithubConfig,
  GuildThunderstoreConfig,
  PrismaClient,
} from '@prisma/client';

import { getPrisma } from '../db/prisma.js';
import {
  type GithubEvents,
  githubEventsSchema,
  hasEnabledGithubEvent,
} from './github-events.js';

export class GithubEventsValidationError extends Error {
  constructor(message = 'At least one GitHub event must be enabled') {
    super(message);
    this.name = 'GithubEventsValidationError';
  }
}

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

  async getThunderstore(guildId: string): Promise<GuildThunderstoreConfig | null> {
    return this.db.guildThunderstoreConfig.findUnique({ where: { guildId } });
  }

  async listThunderstoreGuilds(): Promise<GuildThunderstoreConfig[]> {
    return this.db.guildThunderstoreConfig.findMany();
  }

  async upsertThunderstore(
    guildId: string,
    channelId: string,
    pingRoleId: string,
  ): Promise<GuildThunderstoreConfig> {
    await this.ensureGuildRow(guildId);
    return this.db.guildThunderstoreConfig.upsert({
      where: { guildId },
      create: { guildId, channelId, pingRoleId },
      update: { channelId, pingRoleId },
    });
  }

  async getGithub(guildId: string): Promise<GuildGithubConfig | null> {
    return this.db.guildGithubConfig.findUnique({ where: { guildId } });
  }

  async listGithubGuilds(): Promise<GuildGithubConfig[]> {
    return this.db.guildGithubConfig.findMany();
  }

  async upsertGithub(
    guildId: string,
    channelId: string,
    events: GithubEvents,
  ): Promise<GuildGithubConfig> {
    const parsed = githubEventsSchema.parse(events);
    if (!hasEnabledGithubEvent(parsed)) {
      throw new GithubEventsValidationError();
    }
    await this.ensureGuildRow(guildId);
    return this.db.guildGithubConfig.upsert({
      where: { guildId },
      create: { guildId, channelId, events: parsed },
      update: { channelId, events: parsed },
    });
  }

  private async ensureGuildRow(guildId: string): Promise<void> {
    await this.db.guildConfig.upsert({
      where: { guildId },
      create: { guildId },
      update: {},
    });
  }
}
