import { Client, GatewayIntentBits, Partials } from 'discord.js';

/** Minimal intents per discord-bot-architect: Guilds only until message features need more. */
export function createBotClient(): Client {
  return new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel],
  });
}
