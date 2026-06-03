import { GuildConfigStore } from '../lib/config/guild-config-store.js';
import { WatcherDedupeStore } from '../lib/dedupe/watcher-dedupe-store.js';
import { DiscordRestPoster } from '../lib/discord/discord-rest-poster.js';
import type { WorkerEnv } from '../lib/env.js';
import type { JobQueue } from '../lib/queue/job-queue.js';
import { GlobalPackageRegistry } from '../lib/packages/global-package-registry.js';
import { ThunderstoreClient } from '../lib/watchers/thunderstore-client.js';
import { ThunderstoreWatcher } from '../lib/watchers/thunderstore-watcher.js';

export interface ThunderstoreWorkerDeps {
  jobQueue: JobQueue;
  registry: GlobalPackageRegistry;
  guildConfig: GuildConfigStore;
  client: ThunderstoreClient;
  dedupe: WatcherDedupeStore;
  discord: DiscordRestPoster;
  watcher: ThunderstoreWatcher;
}

export function createThunderstoreWorkerDeps(
  env: WorkerEnv,
  jobQueue: JobQueue,
): ThunderstoreWorkerDeps {
  const registry = new GlobalPackageRegistry();
  const client = new ThunderstoreClient();
  const watcher = new ThunderstoreWatcher(registry, client, jobQueue);
  return {
    jobQueue,
    registry,
    guildConfig: new GuildConfigStore(),
    client,
    dedupe: new WatcherDedupeStore(),
    discord: new DiscordRestPoster(env.DISCORD_TOKEN),
    watcher,
  };
}
