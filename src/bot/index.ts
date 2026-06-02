import { pathToFileURL } from 'node:url';

import { loadEnv } from '../lib/env.js';
import { logger } from '../lib/log.js';
import { createBotClient } from './client.js';
import { registerInteractionHandler } from './handlers/interaction-create.js';
import { registerMessageHandler } from './handlers/message-create.js';
import { registerSlashCommands } from './register-commands.js';

const isMain =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

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

if (isMain) {
  void startBot().catch((err: unknown) => {
    logger.error('Bot failed to start', { error: err instanceof Error ? err.message : String(err) });
    process.exitCode = 1;
  });
}

