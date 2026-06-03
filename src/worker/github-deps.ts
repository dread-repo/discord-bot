import { GuildConfigStore } from '../lib/config/guild-config-store.js';
import { WatcherDedupeStore } from '../lib/dedupe/watcher-dedupe-store.js';
import { DiscordRestPoster } from '../lib/discord/discord-rest-poster.js';
import type { WorkerEnv } from '../lib/env.js';
import type { JobQueue } from '../lib/queue/job-queue.js';
import { GlobalPackageRegistry } from '../lib/packages/global-package-registry.js';

export interface GithubWorkerDeps {
  jobQueue: JobQueue;
  guildConfig: GuildConfigStore;
  dedupe: WatcherDedupeStore;
  discord: DiscordRestPoster;
  registry: GlobalPackageRegistry;
}

export function createGithubWorkerDeps(env: WorkerEnv, jobQueue: JobQueue): GithubWorkerDeps {
  return {
    jobQueue,
    guildConfig: new GuildConfigStore(),
    dedupe: new WatcherDedupeStore(),
    discord: new DiscordRestPoster(env.DISCORD_TOKEN),
    registry: new GlobalPackageRegistry(),
  };
}
