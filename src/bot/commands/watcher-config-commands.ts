import { ApplicationCommandOptionType, ChannelType } from 'discord.js';

export const THUNDERSTORE_COMMAND = {
  name: 'thunderstore',
  description: 'Thunderstore mod update announcements',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'setup',
      description: 'Register announcement channel and ping role',
      options: [
        {
          type: ApplicationCommandOptionType.Channel,
          name: 'channel',
          description: 'Channel for Thunderstore announcements',
          required: true,
          channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
        },
        {
          type: ApplicationCommandOptionType.Role,
          name: 'role',
          description: 'Role to ping on new mod versions',
          required: true,
        },
      ],
    },
  ],
} as const;

export const GITHUB_COMMAND = {
  name: 'github',
  description: 'GitHub repository announcements',
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: 'setup',
      description: 'Register announcement channel and enabled events',
      options: [
        {
          type: ApplicationCommandOptionType.Channel,
          name: 'channel',
          description: 'Channel for GitHub announcements',
          required: true,
          channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'push',
          description: 'Announce push events',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'pr',
          description: 'Announce pull request events',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'ci',
          description: 'Announce CI workflow events',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'release',
          description: 'Announce release events',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'issues',
          description: 'Announce issue events',
          required: false,
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'deployment',
          description: 'Announce deployment events',
          required: false,
        },
      ],
    },
  ],
} as const;
