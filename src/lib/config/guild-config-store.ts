import type { Prisma, PrismaClient } from '@prisma/client';

import { prisma } from '../db/prisma.js';
import { type GitHubEvents, parseGitHubEvents } from './github-events.js';

export interface ThunderstoreGuildConfig {
  guildId: string;
  channelId: string;
  pingRoleId: string;
}

export interface GitHubGuildConfig {
  guildId: string;
  channelId: string;
  events: GitHubEvents;
}

export class GuildConfigStore {
  constructor(private readonly db: PrismaClient = prisma) {}

  async ensureGuild(guildId: string): Promise<void> {
    await this.db.guildConfig.upsert({
      where: { guildId },
      create: { guildId },
      update: {},
    });
  }

  async setThunderstoreConfig(
    guildId: string,
    channelId: string,
    pingRoleId: string,
  ): Promise<void> {
    await this.ensureGuild(guildId);
    await this.db.guildThunderstoreConfig.upsert({
      where: { guildId },
      create: { guildId, channelId, pingRoleId },
      update: { channelId, pingRoleId },
    });
  }

  async getThunderstoreConfig(guildId: string): Promise<ThunderstoreGuildConfig | null> {
    const row = await this.db.guildThunderstoreConfig.findUnique({ where: { guildId } });
    if (!row) return null;
    return {
      guildId: row.guildId,
      channelId: row.channelId,
      pingRoleId: row.pingRoleId,
    };
  }

  async listThunderstoreGuilds(): Promise<ThunderstoreGuildConfig[]> {
    const rows = await this.db.guildThunderstoreConfig.findMany();
    return rows.map((row) => ({
      guildId: row.guildId,
      channelId: row.channelId,
      pingRoleId: row.pingRoleId,
    }));
  }

  async setGitHubConfig(
    guildId: string,
    channelId: string,
    events: GitHubEvents,
  ): Promise<void> {
    await this.ensureGuild(guildId);
    const eventsJson = events as Prisma.InputJsonValue;
    await this.db.guildGithubConfig.upsert({
      where: { guildId },
      create: { guildId, channelId, events: eventsJson },
      update: { channelId, events: eventsJson },
    });
  }

  async getGitHubConfig(guildId: string): Promise<GitHubGuildConfig | null> {
    const row = await this.db.guildGithubConfig.findUnique({ where: { guildId } });
    if (!row) return null;
    return {
      guildId: row.guildId,
      channelId: row.channelId,
      events: parseGitHubEvents(row.events),
    };
  }

  async listGitHubGuilds(): Promise<GitHubGuildConfig[]> {
    const rows = await this.db.guildGithubConfig.findMany();
    return rows.map((row) => ({
      guildId: row.guildId,
      channelId: row.channelId,
      events: parseGitHubEvents(row.events),
    }));
  }

  async isBotAdmin(guildId: string, userId: string): Promise<boolean> {
    const row = await this.db.guildBotAdmin.findUnique({
      where: { guildId_userId: { guildId, userId } },
    });
    return row !== null;
  }

  async grantBotAdmin(guildId: string, userId: string): Promise<void> {
    await this.ensureGuild(guildId);
    await this.db.guildBotAdmin.upsert({
      where: { guildId_userId: { guildId, userId } },
      create: { guildId, userId },
      update: {},
    });
  }
}
