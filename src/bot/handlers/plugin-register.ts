import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

import { DuplicateGlobalPackageError } from '../../lib/packages/global-package-registry.js';
import type { GlobalPackageRegistry } from '../../lib/packages/global-package-registry.js';
import { logError } from '../../lib/log.js';
import type { PermissionResolver } from '../../lib/permissions/permission-resolver.js';
import { getPermissionContext } from '../interaction-permission.js';

const PERMISSION_DENIED =
  'Only administrators in the official Dread guild can register global packages.';
const NO_GUILD = 'This command can only be used in a server.';
const DB_ERROR = 'Something went wrong saving the package. Try again later.';
const UNKNOWN_SUBCOMMAND = 'Unknown subcommand.';

export interface PluginRegisterDeps {
  permissions: PermissionResolver;
  registry: GlobalPackageRegistry;
}

export function createPluginRegisterHandler(deps: PluginRegisterDeps) {
  return async function handlePluginRegister(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    if (interaction.options.getSubcommand(false) !== 'register') {
      await interaction.reply({ content: UNKNOWN_SUBCOMMAND, ephemeral: true });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const ctx = getPermissionContext(interaction);
    if (ctx === null) {
      await interaction.editReply({ content: NO_GUILD });
      return;
    }

    const allowed = await deps.permissions.can('globalPluginRegister', ctx);
    if (!allowed) {
      await interaction.editReply({ content: PERMISSION_DENIED });
      return;
    }

    const namespace = interaction.options.getString('namespace', true);
    const name = interaction.options.getString('name', true);
    const isCore = interaction.options.getBoolean('is_core') ?? false;

    try {
      await deps.registry.register({
        namespace,
        name,
        isCore,
        registeredBy: ctx.userId,
      });
    } catch (err: unknown) {
      if (err instanceof DuplicateGlobalPackageError) {
        await interaction.editReply({ content: err.message });
        return;
      }
      logError('[bot] plugin register failed', err);
      await interaction.editReply({ content: DB_ERROR });
      return;
    }

    await interaction.editReply({
      content: `Registered **${namespace}/${name}** for global Thunderstore watching. New versions will announce after the next poll.`,
    });
  };
}
