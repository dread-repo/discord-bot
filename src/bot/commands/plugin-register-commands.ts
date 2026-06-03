import { ApplicationCommandOptionType } from 'discord.js';

export const PLUGIN_COMMAND = {
  name: 'plugin',
  description: 'Global Thunderstore package registration (official guild)',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'register',
      description: 'Register a package for global Thunderstore watching',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'namespace',
          description: 'Thunderstore namespace',
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'name',
          description: 'Thunderstore package name',
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'is_core',
          description: 'Mark as core package (dread branding)',
          required: false,
        },
      ],
    },
  ],
} as const;
