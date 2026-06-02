import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { getSupabase } from './supabase.js';
import { type GitHubEvents, parseGitHubEvents } from './github-events.js';

const thunderstoreRowSchema = z.object({
  guild_id: z.string(),
  channel_id: z.string(),
  ping_role_id: z.string(),
});

const githubRowSchema = z.object({
  guild_id: z.string(),
  channel_id: z.string(),
  events: z.unknown(),
});

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
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

  async ensureGuild(guildId: string): Promise<void> {
    const { error } = await this.db.from('guild_config').upsert(
      { guild_id: guildId, updated_at: new Date().toISOString() },
      { onConflict: 'guild_id' },
    );
    if (error) throw error;
  }

  async setThunderstoreConfig(
    guildId: string,
    channelId: string,
    pingRoleId: string,
  ): Promise<void> {
    await this.ensureGuild(guildId);
    const { error } = await this.db.from('guild_thunderstore_config').upsert(
      {
        guild_id: guildId,
        channel_id: channelId,
        ping_role_id: pingRoleId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'guild_id' },
    );
    if (error) throw error;
  }

  async getThunderstoreConfig(guildId: string): Promise<ThunderstoreGuildConfig | null> {
    const { data, error } = await this.db
      .from('guild_thunderstore_config')
      .select('guild_id, channel_id, ping_role_id')
      .eq('guild_id', guildId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = thunderstoreRowSchema.parse(data);
    return {
      guildId: row.guild_id,
      channelId: row.channel_id,
      pingRoleId: row.ping_role_id,
    };
  }

  async listThunderstoreGuilds(): Promise<ThunderstoreGuildConfig[]> {
    const { data, error } = await this.db
      .from('guild_thunderstore_config')
      .select('guild_id, channel_id, ping_role_id');
    if (error) throw error;
    return thunderstoreRowSchema.array().parse(data).map((row) => ({
      guildId: row.guild_id,
      channelId: row.channel_id,
      pingRoleId: row.ping_role_id,
    }));
  }

  async setGitHubConfig(
    guildId: string,
    channelId: string,
    events: GitHubEvents,
  ): Promise<void> {
    await this.ensureGuild(guildId);
    const { error } = await this.db.from('guild_github_config').upsert(
      {
        guild_id: guildId,
        channel_id: channelId,
        events,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'guild_id' },
    );
    if (error) throw error;
  }

  async getGitHubConfig(guildId: string): Promise<GitHubGuildConfig | null> {
    const { data, error } = await this.db
      .from('guild_github_config')
      .select('guild_id, channel_id, events')
      .eq('guild_id', guildId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = githubRowSchema.parse(data);
    return {
      guildId: row.guild_id,
      channelId: row.channel_id,
      events: parseGitHubEvents(row.events),
    };
  }

  async listGitHubGuilds(): Promise<GitHubGuildConfig[]> {
    const { data, error } = await this.db
      .from('guild_github_config')
      .select('guild_id, channel_id, events');
    if (error) throw error;
    return githubRowSchema.array().parse(data).map((row) => ({
      guildId: row.guild_id,
      channelId: row.channel_id,
      events: parseGitHubEvents(row.events),
    }));
  }

  async isBotAdmin(guildId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.db
      .from('guild_bot_admins')
      .select('user_id')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  }

  async grantBotAdmin(guildId: string, userId: string): Promise<void> {
    await this.ensureGuild(guildId);
    const { error } = await this.db.from('guild_bot_admins').upsert(
      { guild_id: guildId, user_id: userId },
      { onConflict: 'guild_id,user_id' },
    );
    if (error) throw error;
  }
}
