/**
 * Components v2 announcements via @discordjs/builders (see discord.js 14.26 docs).
 */
import { ActionRowBuilder, ButtonBuilder, ContainerBuilder, TextDisplayBuilder } from '@discordjs/builders';
import {
  ButtonStyle,
  MessageFlags,
  type InteractionReplyOptions,
  type MessageCreateOptions,
  type MessageEditOptions,
} from 'discord.js';

import { MAX_ANNOUNCE_BODY_CHARS } from '../constants.js';

export interface AnnounceMeta {
  kind: 'thunderstore' | 'github';
  label: string;
  versionOrRef: string;
  timestamp: Date;
  body: string;
  bodyIsLlmSummary: boolean;
  githubUrl?: string | undefined;
  thunderstoreUrl?: string | undefined;
}

export type SimpleTextOptions = MessageCreateOptions | MessageEditOptions;
export type InteractionContainerReply = InteractionReplyOptions;

export function buildAnnounceContainer(meta: AnnounceMeta): SimpleTextOptions {
  const header = `**dread** · ${meta.label}`;
  const metaLine = `${meta.versionOrRef} · ${meta.timestamp.toISOString()}`;
  const bodyPrefix = meta.bodyIsLlmSummary
    ? '**Summary (LLM)** — full details on Thunderstore/GitHub.\n\n'
    : '';
  const body =
    meta.body.length > MAX_ANNOUNCE_BODY_CHARS
      ? meta.body.slice(0, MAX_ANNOUNCE_BODY_CHARS)
      : meta.body;

  const container = new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${header}\n${metaLine}\n\n${bodyPrefix}${body}`),
  );

  const buttons: ButtonBuilder[] = [];
  if (meta.githubUrl) {
    buttons.push(
      new ButtonBuilder().setLabel('GitHub').setStyle(ButtonStyle.Link).setURL(meta.githubUrl),
    );
  }
  if (meta.thunderstoreUrl) {
    buttons.push(
      new ButtonBuilder()
        .setLabel('Thunderstore')
        .setStyle(ButtonStyle.Link)
        .setURL(meta.thunderstoreUrl),
    );
  }
  if (buttons.length > 0) {
    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons),
    );
  }

  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  };
}

export function buildEphemeralError(content: string): InteractionReplyOptions {
  return { content, flags: MessageFlags.Ephemeral };
}

export function buildSimpleContainer(content: string): InteractionContainerReply {
  const container = new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(content),
  );
  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  };
}
