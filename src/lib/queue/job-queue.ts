import { Queue, type JobsOptions } from 'bullmq';
import { Redis } from 'ioredis';

import { toBullMqQueueName } from './bullmq-queue-name.js';
import type { QueueName, QueuePayloadMap } from './queue-types.js';

export interface RedisConnectionOptions {
  url: string;
  maxRetriesPerRequest: null;
}

export class JobQueue {
  private readonly connection: RedisConnectionOptions;
  private readonly queues = new Map<QueueName, Queue>();
  private sharedClient: Redis | undefined;

  constructor(redisUrl: string) {
    this.connection = { url: redisUrl, maxRetriesPerRequest: null };
  }

  getConnectionOptions(): RedisConnectionOptions {
    return this.connection;
  }

  /** Dedicated client for ping verification and worker sharing. */
  getSharedClient(): Redis {
    this.sharedClient ??= new Redis(this.connection.url, {
      maxRetriesPerRequest: this.connection.maxRetriesPerRequest,
    });
    return this.sharedClient;
  }

  private getQueue(name: QueueName): Queue {
    let queue = this.queues.get(name);
    if (queue === undefined) {
      queue = new Queue(toBullMqQueueName(name), { connection: this.connection });
      this.queues.set(name, queue);
    }
    return queue;
  }

  async enqueue<Q extends QueueName>(
    queueName: Q,
    jobName: string,
    data: QueuePayloadMap[Q],
    opts?: JobsOptions,
  ): Promise<string> {
    const job = await this.getQueue(queueName).add(jobName, data, opts);
    return job.id ?? job.name;
  }

  async close(): Promise<void> {
    await Promise.all([...this.queues.values()].map((q) => q.close()));
    this.queues.clear();
    if (this.sharedClient !== undefined) {
      await this.sharedClient.quit();
      this.sharedClient = undefined;
    }
  }
}

export async function verifyRedisConnection(redisUrl: string): Promise<void> {
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5_000,
    retryStrategy: () => null,
  });
  try {
    await redis.ping();
  } finally {
    await redis.quit();
  }
}
