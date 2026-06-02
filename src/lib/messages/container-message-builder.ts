import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type MessageCreateOptions,
  type MessageReplyOptions,
} from 'discord.js';

import { type AnnounceMeta, MAX_BODY_CHARS } from './announce-meta.js';

function formatThunderstoreLabel(meta: AnnounceMeta): string {
  if (meta.label === 'core') {
    return 'core';
  }
  return meta.label.startsWith('plugin:') ? meta.label : `plugin: ${meta.label}`;
}

/**
 * Builds announcement layout per container-message contract.
 * Uses embed + link buttons until discord.js exposes Container v2 builders in this repo's version.
 */
export function buildAnnounceContainer(meta: AnnounceMeta): MessageCreateOptions & MessageReplyOptions {
  const header =
    meta.kind === 'thunderstore'
      ? `dread · ${formatThunderstoreLabel(meta)}`
      : `dread · ${meta.label}`;

  let body = meta.body;
  if (body.length > MAX_BODY_CHARS) {
    body = body.slice(0, MAX_BODY_CHARS);
  }
  if (meta.bodyIsLlmSummary) {
    body = `**Summary (LLM)** — full details on Thunderstore/GitHub.\n\n${body}`;
  }

  const embed = new EmbedBuilder()
    .setTitle(header)
    .setDescription(
      `Version/ref: ${meta.versionOrRef} · ${meta.timestamp.toISOString()}\n\n${body}`,
    );

  const row = new ActionRowBuilder<ButtonBuilder>();
  if (meta.githubUrl !== undefined) {
    row.addComponents(
      new ButtonBuilder().setLabel('GitHub').setStyle(ButtonStyle.Link).setURL(meta.githubUrl),
    );
  }
  if (meta.thunderstoreUrl !== undefined) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel('Thunderstore')
        .setStyle(ButtonStyle.Link)
        .setURL(meta.thunderstoreUrl),
    );
  }

  const components = row.components.length > 0 ? [row] : [];

  return {
    embeds: [embed],
    components,
  };
}
