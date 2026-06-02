import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

import { getPermissionContext } from '../interaction-permission.js';
import {
  GithubEventsValidationError,
  type GuildConfigStore,
} from '../../lib/config/guild-config-store.js';
import {
  formatEnabledGithubEvents,
  githubEventsFromSlashOptions,
  hasEnabledGithubEvent,
} from '../../lib/config/github-events.js';
import { logError } from '../../lib/log.js';
import type { PermissionResolver } from '../../lib/permissions/permission-resolver.js';

const PERMISSION_DENIED = 'You do not have permission to configure watchers.';
const NO_GUILD = 'This command can only be used in a server.';
const DB_ERROR = 'Something went wrong saving configuration. Try again later.';
const NO_EVENTS =
  'Enable at least one GitHub event (push, pr, ci, release, issues, or deployment).';
const UNKNOWN_SUBCOMMAND = 'Unknown subcommand.';

export interface WatcherSetupDeps {
  permissions: PermissionResolver;
  store: GuildConfigStore;
}

export function createGithubSetupHandler(deps: WatcherSetupDeps) {
  return async function handleGithubSetup(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.options.getSubcommand(false) !== 'setup') {
      await interaction.reply({ content: UNKNOWN_SUBCOMMAND, ephemeral: true });
      return;
    }

    const events = githubEventsFromSlashOptions({
      push: interaction.options.getBoolean('push'),
      pr: interaction.options.getBoolean('pr'),
      ci: interaction.options.getBoolean('ci'),
      release: interaction.options.getBoolean('release'),
      issues: interaction.options.getBoolean('issues'),
      deployment: interaction.options.getBoolean('deployment'),
    });

    if (!hasEnabledGithubEvent(events)) {
      await interaction.reply({ content: NO_EVENTS, ephemeral: true });
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

    try {
      await deps.store.upsertGithub(ctx.guildId, channel.id, events);
    } catch (err: unknown) {
      if (err instanceof GithubEventsValidationError) {
        await interaction.editReply({ content: NO_EVENTS });
        return;
      }
      logError('[bot] github setup failed', err);
      await interaction.editReply({ content: DB_ERROR });
      return;
    }

    await interaction.editReply({
      content: `GitHub announcements will post in <#${channel.id}> for: ${formatEnabledGithubEvents(events)}.`,
    });
  };
}
