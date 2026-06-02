import { deployPlatformCommands } from './bot/register-commands.js';
import { loadBotEnv } from './lib/env.js';
import { logError, logInfo } from './lib/log.js';

async function main(): Promise<void> {
  const env = loadBotEnv();
  const guildId = env.DISCORD_DEV_GUILD_ID;
  await deployPlatformCommands(env, guildId);
  logInfo(
    guildId === undefined
      ? '[bot] global commands registered (may take up to ~1 hour to appear)'
      : `[bot] guild commands registered for ${guildId} (usually instant)`,
  );
}

main().catch((err: unknown) => {
  logError('[bot] deploy-commands failed', err);
  process.exit(1);
});
