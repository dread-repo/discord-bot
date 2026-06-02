import type { QueueName } from './queue-types.js';

/**
 * BullMQ disallows `:` in queue names; epic contracts use `watcher:thunderstore` etc.
 * Map logical names (API) → Redis/BullMQ queue names.
 */
export function toBullMqQueueName(logicalName: QueueName): string {
  return logicalName.replaceAll(':', '-');
}
