import { REST, Routes, type MessageCreateOptions } from 'discord.js';

import { loadEnv } from '../env.js';

let rest: REST | undefined;

function getRest(): REST {
  rest ??= new REST({ version: '10' }).setToken(loadEnv().DISCORD_TOKEN);
  return rest;
}

export async function sendChannelMessage(
  channelId: string,
  options: MessageCreateOptions,
): Promise<void> {
  await getRest().post(Routes.channelMessages(channelId), { body: options });
}
