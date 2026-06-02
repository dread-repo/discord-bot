import { REST, Routes, SlashCommandBuilder } from 'discord.js';

import { loadEnv } from '../lib/env.js';
import { logger } from '../lib/log.js';

export function buildCommandPayloads() {
  return [
    new SlashCommandBuilder()
      .setName('thunderstore')
      .setDescription('Thunderstore watcher configuration')
      .addSubcommand((sub) =>
        sub
          .setName('setup')
          .setDescription('Set announcement channel and ping role')
          .addChannelOption((opt) =>
            opt.setName('channel').setDescription('Announcement channel').setRequired(true),
          )
          .addRoleOption((opt) =>
            opt.setName('role').setDescription('Role to ping on updates').setRequired(true),
          ),
      ),
    new SlashCommandBuilder()
      .setName('github')
      .setDescription('GitHub watcher configuration')
      .addSubcommand((sub) =>
        sub
          .setName('setup')
          .setDescription('Set GitHub announcement channel and events')
          .addChannelOption((opt) =>
            opt.setName('channel').setDescription('Announcement channel').setRequired(true),
          )
          .addBooleanOption((opt) => opt.setName('push').setDescription('Push to default branch'))
          .addBooleanOption((opt) => opt.setName('pr').setDescription('Pull requests'))
          .addBooleanOption((opt) => opt.setName('ci').setDescription('CI workflow runs'))
          .addBooleanOption((opt) => opt.setName('release').setDescription('Releases'))
          .addBooleanOption((opt) => opt.setName('issues').setDescription('Issues'))
          .addBooleanOption((opt) =>
            opt.setName('deployment').setDescription('Deployment status'),
          ),
      ),
  ];
}

export async function registerSlashCommands(): Promise<void> {
  const env = loadEnv();
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  const body = buildCommandPayloads().map((c) => c.toJSON());

  if (env.DISCORD_DEV_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_APPLICATION_ID, env.DISCORD_DEV_GUILD_ID), {
      body,
    });
    logger.info('Registered guild slash commands', { guildId: env.DISCORD_DEV_GUILD_ID });
    return;
  }

  await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), { body });
  logger.info('Registered global slash commands');
}
