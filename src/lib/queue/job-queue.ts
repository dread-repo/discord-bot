import { Queue, Worker, type Job, type JobsOptions, type Processor } from 'bullmq';

import { loadEnv } from '../env.js';
import { logger } from '../log.js';

export const QUEUE_NAMES = {
  thunderstore: 'watcher:thunderstore',
  github: 'watcher:github',
  changelogSummarize: 'llm:changelog-summarize',
  announcementReview: 'llm:announcement-review',
  forumPost: 'forum:post-pipeline',
  repoScan: 'index:repo-scan',
  dreadReply: 'llm:dread-reply',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

function connectionOptions() {
  const env = loadEnv();
  return {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  };
}

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: 500,
};

export class JobQueue {
  private readonly queues = new Map<QueueName, Queue>();

  getQueue(name: QueueName): Queue {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Queue(name, {
        connection: connectionOptions(),
        defaultJobOptions,
      });
      this.queues.set(name, queue);
    }
    return queue;
  }

  async add(name: QueueName, jobName: string, data: object, opts?: JobsOptions): Promise<void> {
    await this.getQueue(name).add(jobName, data, opts);
  }

  createWorker(
    name: QueueName,
    processor: Processor,
    concurrency: number,
  ): Worker {
    const worker = new Worker(name, processor, {
      connection: connectionOptions(),
      concurrency,
    });
    worker.on('failed', (job: Job | undefined, err: Error) => {
      logger.error('Job failed', { queue: name, jobId: job?.id, error: err.message });
    });
    return worker;
  }
}
