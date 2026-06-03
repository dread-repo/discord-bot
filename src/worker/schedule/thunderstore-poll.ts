import { logInfo } from '../../lib/log.js';
import type { JobQueue } from '../../lib/queue/job-queue.js';

const DEFAULT_POLL_INTERVAL_MS = 600_000;

export function scheduleThunderstorePoll(
  jobQueue: JobQueue,
  intervalMs: number = DEFAULT_POLL_INTERVAL_MS,
): void {
  const enqueuePoll = (): void => {
    void jobQueue
      .enqueue('watcher:thunderstore', 'poll', { kind: 'poll' })
      .catch((err: unknown) => {
        logInfo(`[worker] thunderstore poll enqueue failed: ${String(err)}`);
      });
  };

  enqueuePoll();
  setInterval(enqueuePoll, intervalMs);
  logInfo(`[worker] thunderstore poll scheduled every ${String(intervalMs)}ms`);
}
