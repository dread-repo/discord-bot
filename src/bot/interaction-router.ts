import type { ChatInputCommandInteraction } from 'discord.js';

export type InteractionHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;

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
    await handler(interaction);
  }
}
