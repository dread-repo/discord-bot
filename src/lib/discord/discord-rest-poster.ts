import {
  ActionRowBuilder,
  EmbedBuilder,
  REST,
  Routes,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type RESTPostAPIChannelMessageJSONBody,
} from 'discord.js';

import { buildAnnounceContainer } from '../messages/container-message-builder.js';
import type { AnnounceMeta } from '../messages/announce-meta.js';

export class DiscordRestPoster {
  constructor(private readonly token: string) {}

  async postAnnounce(channelId: string, pingRoleId: string, meta: AnnounceMeta): Promise<void> {
    const built = buildAnnounceContainer(meta);
    const apiEmbeds: APIEmbed[] = [];
    for (const embed of built.embeds ?? []) {
      if (embed instanceof EmbedBuilder) {
        apiEmbeds.push(embed.toJSON());
      }
    }

    const apiComponents: APIActionRowComponent<APIButtonComponent>[] = [];
    for (const row of built.components ?? []) {
      if (row instanceof ActionRowBuilder) {
        apiComponents.push(row.toJSON() as APIActionRowComponent<APIButtonComponent>);
      }
    }

    const body: RESTPostAPIChannelMessageJSONBody = {
      content: `<@&${pingRoleId}>`,
      embeds: apiEmbeds.length > 0 ? apiEmbeds : undefined,
      components: apiComponents.length > 0 ? apiComponents : undefined,
    };
    const rest = new REST({ version: '10' }).setToken(this.token);
    await rest.post(Routes.channelMessages(channelId), { body });
  }
}
