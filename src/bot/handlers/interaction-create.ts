import { Events, type Client, type Interaction } from 'discord.js';

import { executeGitHubSetup } from '../../lib/commands/github-setup.js';
import { executeThunderstoreSetup } from '../../lib/commands/thunderstore-setup.js';
import { logger } from '../../lib/log.js';
import { buildEphemeralError } from '../../lib/messages/container-message-builder.js';

async function handleInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === 'thunderstore' && interaction.options.getSubcommand() === 'setup') {
      await executeThunderstoreSetup(interaction);
      return;
    }
    if (interaction.commandName === 'github' && interaction.options.getSubcommand() === 'setup') {
      await executeGitHubSetup(interaction);
      return;
    }
  } catch (err) {
    logger.error('Command handler error', {
      command: interaction.commandName,
      error: err instanceof Error ? err.message : String(err),
    });
    const payload = buildEphemeralError('Something went wrong running that command.');
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    } catch (replyErr) {
      logger.warn('Could not send command error reply', {
        command: interaction.commandName,
        error: replyErr instanceof Error ? replyErr.message : String(replyErr),
      });
    }
  }
}

export function registerInteractionHandler(client: Client): void {
  client.on(Events.InteractionCreate, (interaction) => {
    void handleInteraction(interaction);
  });
}
