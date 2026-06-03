import type { Processor } from 'bullmq';

import type { ThunderstoreWatchJob } from '../../lib/queue/queue-types.js';
import type { ThunderstoreWorkerDeps } from '../thunderstore-deps.js';

export function createThunderstorePollProcessor(
  deps: ThunderstoreWorkerDeps,
): Processor<ThunderstoreWatchJob> {
  return async () => {
    await deps.watcher.checkAllPackages();
  };
}
