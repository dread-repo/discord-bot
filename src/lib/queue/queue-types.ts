import type { MappedGithubEvent } from '../watchers/github-types.js';

/**
 * Logical queue names per epic job-queues contract (`:` namespace).
 * BullMQ uses hyphenated Redis names via `toBullMqQueueName()` (colons are invalid).
 */
export const QUEUE_NAMES = [
  'watcher:thunderstore',
  'watcher:github',
  'llm:changelog-summarize',
  'llm:announcement-review',
  'forum:post-pipeline',
  'index:repo-scan',
  'llm:dread-reply',
] as const;

export type QueueName = (typeof QUEUE_NAMES)[number];

export type ThunderstoreWatchJob =
  | { kind: 'poll' }
  | { kind: 'announce'; packageKey: string; version: string };

export interface GitHubWatchJob {
  deliveryId: string;
  event: MappedGithubEvent['event'];
  mapped: MappedGithubEvent;
}

export interface ChangelogSummarizeJob {
  source: 'thunderstore' | 'github';
  fullText: string;
  urls: { github?: string; thunderstore?: string };
  announceMeta: Record<string, unknown>;
}

export interface AnnouncementReviewJob {
  draftId: string;
  guildId: string;
  userId: string;
  content: string;
}

export interface ForumPostJob {
  guildId: string;
  threadId: string;
  channelId: string;
  starterMessageId: string;
  tagIds: string[];
  title: string;
  body: string;
}

export interface RepoScanJob {
  threadId: string;
  repo: string;
  question: string;
}

export interface DreadReplyJob {
  guildId: string;
  channelId: string;
  messageId: string;
  content: string;
}

export interface QueuePayloadMap {
  'watcher:thunderstore': ThunderstoreWatchJob;
  'watcher:github': GitHubWatchJob;
  'llm:changelog-summarize': ChangelogSummarizeJob;
  'llm:announcement-review': AnnouncementReviewJob;
  'forum:post-pipeline': ForumPostJob;
  'index:repo-scan': RepoScanJob;
  'llm:dread-reply': DreadReplyJob;
}
