import { Worker, type Processor } from 'bullmq';

import { logInfo } from '../lib/log.js';
import type { RedisConnectionOptions } from '../lib/queue/job-queue.js';
import { toBullMqQueueName } from '../lib/queue/bullmq-queue-name.js';
import { QUEUE_NAMES } from '../lib/queue/queue-types.js';
import { processPlatformSmokeJob } from './processors/platform-smoke.js';
import { createThunderstoreProcessor } from './processors/thunderstore-processor.js';
import type { ThunderstoreWorkerDeps } from './thunderstore-deps.js';

export interface WorkerRegistry {
  workers: Worker[];
  close: () => Promise<void>;
}

const stubProcessor =
  (queueName: string): Processor =>
  (job) => {
    logInfo(`[worker] stub ${queueName} job=${job.id ?? job.name}`);
    return Promise.resolve();
  };

export function registerProcessors(
  connection: RedisConnectionOptions,
  thunderstoreDeps: ThunderstoreWorkerDeps,
): WorkerRegistry {
  const workers: Worker[] = [];

  for (const queueName of QUEUE_NAMES) {
    let processor: Processor = stubProcessor(queueName);
    if (queueName === 'llm:dread-reply') {
      processor = processPlatformSmokeJob;
    } else if (queueName === 'watcher:thunderstore') {
      processor = createThunderstoreProcessor(thunderstoreDeps);
    }
    workers.push(
      new Worker(toBullMqQueueName(queueName), processor, {
        connection,
      }),
    );
    logInfo(`[worker] registered processor for queue ${queueName}`);
  }

  return {
    workers,
    close: async () => {
      await Promise.all(workers.map((w) => w.close()));
    },
  };
}
