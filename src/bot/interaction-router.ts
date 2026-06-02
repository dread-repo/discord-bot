import type { ChatInputCommandInteraction } from 'discord.js';

import { logError } from '../lib/log.js';

export type InteractionHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;

const HANDLER_ERROR = 'Something went wrong handling that command. Try again in a moment.';

export class InteractionRouter {
  private readonly handlers = new Map<string, InteractionHandler>();

  register(commandName: string, handler: InteractionHandler): void {
    this.handlers.set(commandName, handler);
  }

  async dispatch(interaction: ChatInputCommandInteraction): Promise<void> {
    const handler = this.handlers.get(interaction.commandName);
    if (handler === undefined) {
      await interaction.reply({ content: 'Unknown command.', ephemeral: true });
      return;
    }

    try {
      await handler(interaction);
    } catch (err: unknown) {
      logError(`[bot] handler failed for /${interaction.commandName}`, err);
      await this.replyHandlerError(interaction);
    }
  }

  private async replyHandlerError(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: HANDLER_ERROR });
        return;
      }
      await interaction.reply({ content: HANDLER_ERROR, ephemeral: true });
    } catch (replyErr: unknown) {
      logError('[bot] could not send handler error reply', replyErr);
    }
  }
}
