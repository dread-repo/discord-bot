import { describe, expect, it } from 'vitest';

import { toBullMqQueueName } from './bullmq-queue-name.js';

describe('toBullMqQueueName', () => {
  it('replaces colons for BullMQ', () => {
    expect(toBullMqQueueName('watcher:thunderstore')).toBe('watcher-thunderstore');
    expect(toBullMqQueueName('llm:dread-reply')).toBe('llm-dread-reply');
  });
});
