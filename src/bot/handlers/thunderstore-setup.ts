import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

import { getPermissionContext } from '../interaction-permission.js';
import type { GuildConfigStore } from '../../lib/config/guild-config-store.js';
import { logError } from '../../lib/log.js';
import type { PermissionResolver } from '../../lib/permissions/permission-resolver.js';

const PERMISSION_DENIED = 'You do not have permission to configure watchers.';
const NO_GUILD = 'This command can only be used in a server.';
const DB_ERROR = 'Something went wrong saving configuration. Try again later.';
const UNKNOWN_SUBCOMMAND = 'Unknown subcommand.';

export interface WatcherSetupDeps {
  permissions: PermissionResolver;
  store: GuildConfigStore;
}

export function createThunderstoreSetupHandler(deps: WatcherSetupDeps) {
  return async function handleThunderstoreSetup(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    if (interaction.options.getSubcommand(false) !== 'setup') {
      await interaction.reply({ content: UNKNOWN_SUBCOMMAND, ephemeral: true });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const ctx = getPermissionContext(interaction);
    if (ctx === null) {
      await interaction.editReply({ content: NO_GUILD });
      return;
    }

    const allowed = await deps.permissions.can('config', ctx);
    if (!allowed) {
      await interaction.editReply({ content: PERMISSION_DENIED });
      return;
    }

    const channel = interaction.options.getChannel('channel', true);
    const role = interaction.options.getRole('role', true);

    try {
      await deps.store.upsertThunderstore(ctx.guildId, channel.id, role.id);
    } catch (err: unknown) {
      logError('[bot] thunderstore setup failed', err);
      await interaction.editReply({ content: DB_ERROR });
      return;
    }

    await interaction.editReply({
      content: `Thunderstore announcements will post in <#${channel.id}> and ping <@&${role.id}>.`,
    });
  };
}
