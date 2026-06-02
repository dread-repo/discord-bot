import { createDiscordClient } from './bot/client.js';
import { wireInteractionRouter } from './bot/handlers/interaction-create.js';
import { deployPlatformCommands } from './bot/register-commands.js';
import { registerBotShutdown } from './bot/shutdown.js';
import { loadBotEnv } from './lib/env.js';
import { logError, logInfo } from './lib/log.js';
import { JobQueue } from './lib/queue/job-queue.js';

export async function main(): Promise<void> {
  const env = loadBotEnv();
  const client = createDiscordClient();
  const jobQueue = new JobQueue(env.REDIS_URL);

  wireInteractionRouter(client, jobQueue);
  registerBotShutdown({ client, jobQueue });

  client.once('ready', () => {
    logInfo(`[bot] gateway ready as ${client.user?.tag ?? 'unknown'}`);
    void deployPlatformCommands(env, env.DISCORD_DEV_GUILD_ID).catch((err: unknown) => {
      logError('[bot] slash command deploy failed', err);
    });
  });

  await client.login(env.DISCORD_TOKEN);
}

main().catch((err: unknown) => {
  logError('[bot] fatal startup error', err);
  process.exit(1);
});
