import type { Processor } from 'bullmq';

import type { ThunderstoreWatchJob } from '../../lib/queue/queue-types.js';
import type { ThunderstoreWorkerDeps } from '../thunderstore-deps.js';
import { createThunderstoreAnnounceProcessor } from './thunderstore-announce.js';
import { createThunderstorePollProcessor } from './thunderstore-poll.js';

export function createThunderstoreProcessor(
  deps: ThunderstoreWorkerDeps,
): Processor<ThunderstoreWatchJob> {
  const poll = createThunderstorePollProcessor(deps);
  const announce = createThunderstoreAnnounceProcessor(deps);

  return async (job) => {
    if (job.data.kind === 'poll') {
      await poll(job);
      return;
    }
    await announce(job);
  };
}
