import { REST, Routes } from 'discord.js';

import type { BotEnv } from '../lib/env.js';
import { logInfo } from '../lib/log.js';

export const PLATFORM_SMOKE_COMMAND = {
  name: 'platform-smoke',
  description: 'Verify platform stack (dev)',
  default_member_permissions: '8', // Administrator
} as const;

export async function deployPlatformCommands(env: BotEnv, guildId?: string): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  const body = [PLATFORM_SMOKE_COMMAND];

  if (guildId !== undefined) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId), { body });
    logInfo(`[bot] deployed ${String(body.length)} guild command(s) to ${guildId}`);
    return;
  }

  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
  logInfo(`[bot] deployed ${String(body.length)} global command(s)`);
}
