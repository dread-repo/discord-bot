import { createDiscordClient } from './bot/client.js';
import { wireInteractionRouter } from './bot/handlers/interaction-create.js';
import { deployBotCommands } from './bot/register-commands.js';
import { registerBotShutdown } from './bot/shutdown.js';
import { GuildConfigStore } from './lib/config/guild-config-store.js';
import { loadBotEnv } from './lib/env.js';
import { loadEnvFile } from './lib/load-env-file.js';
import { logError, logInfo } from './lib/log.js';
import { PermissionResolver } from './lib/permissions/permission-resolver.js';
import { JobQueue } from './lib/queue/job-queue.js';

export async function main(): Promise<void> {
  loadEnvFile();
  const env = loadBotEnv();
  const client = createDiscordClient();
  const jobQueue = new JobQueue(env.REDIS_URL);
  const guildConfigStore = new GuildConfigStore();
  const permissionResolver = new PermissionResolver(guildConfigStore);

  wireInteractionRouter(client, jobQueue, {
    permissions: permissionResolver,
    store: guildConfigStore,
  });
  registerBotShutdown({ client, jobQueue });

  client.once('ready', () => {
    logInfo(`[bot] gateway ready as ${client.user?.tag ?? 'unknown'}`);
    void deployBotCommands(env, env.DISCORD_DEV_GUILD_ID).catch((err: unknown) => {
      logError('[bot] slash command deploy failed', err);
    });
  });

  await client.login(env.DISCORD_TOKEN);
}

main().catch((err: unknown) => {
  logError('[bot] fatal startup error', err);
  process.exit(1);
});
