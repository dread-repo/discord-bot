import { logger } from '../../lib/log.js';
import { QUEUE_NAMES, JobQueue } from '../../lib/queue/job-queue.js';

const noop = async (): Promise<void> => {
  await Promise.resolve();
};

/** Registers BullMQ workers with no-op processors until story phases wire real handlers. */
export function registerProcessors(queue = new JobQueue()): void {
  queue.createWorker(QUEUE_NAMES.thunderstore, async (job) => {
    logger.debug('watcher:thunderstore job', { name: job.name, id: job.id });
    await noop();
  }, 1);

  queue.createWorker(QUEUE_NAMES.github, async (job) => {
    logger.debug('watcher:github job', { name: job.name, id: job.id });
    await noop();
  }, 5);

  queue.createWorker(QUEUE_NAMES.changelogSummarize, async (job) => {
    logger.debug('llm:changelog-summarize job', { id: job.id });
    await noop();
  }, 2);

  queue.createWorker(QUEUE_NAMES.announcementReview, async (job) => {
    logger.debug('llm:announcement-review job', { id: job.id });
    await noop();
  }, 2);

  queue.createWorker(QUEUE_NAMES.forumPost, async (job) => {
    logger.debug('forum:post-pipeline job', { id: job.id });
    await noop();
  }, 3);

  queue.createWorker(QUEUE_NAMES.repoScan, async (job) => {
    logger.debug('index:repo-scan job', { id: job.id });
    await noop();
  }, 1);

  queue.createWorker(QUEUE_NAMES.dreadReply, async (job) => {
    logger.debug('llm:dread-reply job', { id: job.id });
    await noop();
  }, 2);

  logger.info('BullMQ processors registered');
}
