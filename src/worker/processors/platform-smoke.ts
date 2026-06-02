import type { Processor } from 'bullmq';

import { logInfo } from '../../lib/log.js';
import type { DreadReplyJob } from '../../lib/queue/queue-types.js';

export const processPlatformSmokeJob: Processor<DreadReplyJob> = (job) => {
  if (job.name === 'smoke') {
    logInfo(`[worker] platform-smoke job=${job.id ?? job.name} guild=${job.data.guildId}`);
    return Promise.resolve();
  }
  logInfo(`[worker] llm:dread-reply stub job=${job.id ?? job.name}`);
  return Promise.resolve();
};
