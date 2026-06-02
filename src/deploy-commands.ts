import { deployBotCommands } from './bot/register-commands.js';
import { loadDeployEnv } from './lib/env.js';
import { loadEnvFile } from './lib/load-env-file.js';
import { logError, logInfo } from './lib/log.js';

async function main(): Promise<void> {
  loadEnvFile();
  const env = loadDeployEnv();
  const guildId = env.DISCORD_DEV_GUILD_ID;
  await deployBotCommands(env, guildId);
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
