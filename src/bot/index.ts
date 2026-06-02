import { loadEnv } from '../lib/env.js';
import { logger } from '../lib/log.js';
import { createBotClient } from './client.js';
import { registerInteractionHandler } from './handlers/interaction-create.js';
import { registerMessageHandler } from './handlers/message-create.js';
import { registerSlashCommands } from './register-commands.js';

export async function startBot(): Promise<void> {
  loadEnv();
  const client = createBotClient();

  registerInteractionHandler(client);
  registerMessageHandler(client);

  client.once('ready', () => {
    logger.info('Discord bot ready', { user: client.user?.tag });
  });

  await registerSlashCommands();
  await client.login(loadEnv().DISCORD_TOKEN);
}

void startBot().catch((err: unknown) => {
  logger.error('Bot failed to start', { error: err instanceof Error ? err.message : String(err) });
  process.exitCode = 1;
});

