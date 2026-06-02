import { describe, expect, it } from 'vitest';
import { MessageFlags } from 'discord.js';

import {
  buildAnnounceContainer,
  buildSimpleContainer,
} from '../../src/lib/messages/container-message-builder.js';

describe('ContainerMessageBuilder', () => {
  it('builds announce container with Components v2 flag', () => {
    const result = buildAnnounceContainer({
      kind: 'github',
      label: 'dreadREPO',
      versionOrRef: 'v1.0.0',
      timestamp: new Date('2026-06-02T12:00:00.000Z'),
      body: 'Release notes here.',
      bodyIsLlmSummary: true,
      githubUrl: 'https://github.com/dread-repo/dreadREPO/releases/tag/v1.0.0',
    });

    expect(result.flags).toBe(MessageFlags.IsComponentsV2);
    expect(result.components).toHaveLength(1);
    expect(result).toMatchSnapshot();
  });

  it('builds simple text container', () => {
    const result = buildSimpleContainer('Configured successfully.');
    expect(result.flags).toBe(MessageFlags.IsComponentsV2);
    expect(result.components).toHaveLength(1);
    expect(result).toMatchSnapshot();
  });
});
