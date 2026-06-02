import { GlobalPackageRegistry, type GlobalPackage } from '../packages/global-package-registry.js';
import { WatcherDedupeStore } from '../dedupe/watcher-dedupe-store.js';
import { logger } from '../log.js';
import { JobQueue, QUEUE_NAMES } from '../queue/job-queue.js';
import { fetchLatestPackageVersion } from './thunderstore-client.js';

export interface ThunderstoreAnnounceJobData {
  kind: 'announce';
  namespace: string;
  name: string;
  isCore: boolean;
  githubRepo: string | null;
  version: string;
  description: string;
  dateCreatedIso: string;
  thunderstoreUrl: string;
  websiteUrl?: string;
}

const DEFAULT_POLL_INTERVAL_MS = 5 * 60 * 1000;

async function listWatchedPackages(registry: GlobalPackageRegistry): Promise<GlobalPackage[]> {
  const bundled = await registry.loadBundledDefaults();
  const registered = await registry.listAll();
  const byKey = new Map<string, GlobalPackage>();
  for (const pkg of [...bundled, ...registered]) {
    byKey.set(`${pkg.namespace}/${pkg.name}`, pkg);
  }
  return [...byKey.values()];
}

export async function runThunderstorePoll(
  deps: {
    registry?: GlobalPackageRegistry;
    dedupe?: WatcherDedupeStore;
    queue?: JobQueue;
  } = {},
): Promise<void> {
  const registry = deps.registry ?? new GlobalPackageRegistry();
  const dedupe = deps.dedupe ?? new WatcherDedupeStore();
  const queue = deps.queue ?? new JobQueue();
  const packages = await listWatchedPackages(registry);

  if (packages.length === 0) {
    logger.warn('Thunderstore poll: no packages in manifest or global registry');
    return;
  }

  let enqueued = 0;
  for (const pkg of packages) {
    const latest = await fetchLatestPackageVersion(pkg.namespace, pkg.name);
    if (!latest) continue;

    const dedupeKey = `ts:${pkg.namespace}/${pkg.name}:${latest.version}`;
    const claimed = await dedupe.tryClaim(dedupeKey);
    if (!claimed) continue;

    const job: ThunderstoreAnnounceJobData = {
      kind: 'announce',
      namespace: pkg.namespace,
      name: pkg.name,
      isCore: pkg.isCore,
      githubRepo: pkg.githubRepo,
      version: latest.version,
      description: latest.description,
      dateCreatedIso: latest.dateCreated.toISOString(),
      thunderstoreUrl: latest.thunderstoreUrl,
      ...(latest.websiteUrl ? { websiteUrl: latest.websiteUrl } : {}),
    };
    await queue.add(QUEUE_NAMES.thunderstore, 'announce', job);
    enqueued += 1;
    logger.info('Thunderstore version enqueued', {
      package: `${pkg.namespace}/${pkg.name}`,
      version: latest.version,
    });
  }

  logger.info('Thunderstore poll complete', { packages: packages.length, enqueued });
}

export function scheduleThunderstorePoll(
  queue: JobQueue,
  intervalMs = Number(process.env['THUNDERSTORE_POLL_INTERVAL_MS']) || DEFAULT_POLL_INTERVAL_MS,
): void {
  const tick = (): void => {
    void runThunderstorePoll({ queue }).catch((err: unknown) => {
      logger.error('Thunderstore poll failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  };

  tick();
  setInterval(tick, intervalMs);
  logger.info('Thunderstore poll scheduled', { intervalMs });
}
