import { REST, Routes } from 'discord.js';

import type { DeployEnv } from '../lib/env.js';
import { logInfo } from '../lib/log.js';
import { GITHUB_COMMAND, THUNDERSTORE_COMMAND } from './commands/watcher-config-commands.js';

export const PLATFORM_SMOKE_COMMAND = {
  name: 'platform-smoke',
  description: 'Verify platform stack (dev)',
  default_member_permissions: '8', // Administrator
} as const;

export const BOT_COMMANDS = [
  PLATFORM_SMOKE_COMMAND,
  THUNDERSTORE_COMMAND,
  GITHUB_COMMAND,
] as const;

export async function deployBotCommands(env: DeployEnv, guildId?: string): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
  const body = [...BOT_COMMANDS];

  if (guildId !== undefined) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guildId), { body });
    logInfo(`[bot] deployed ${String(body.length)} guild command(s) to ${guildId}`);
    return;
  }

  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
  logInfo(`[bot] deployed ${String(body.length)} global command(s)`);
}

/** @deprecated Use {@link deployBotCommands} */
export const deployPlatformCommands = deployBotCommands;
