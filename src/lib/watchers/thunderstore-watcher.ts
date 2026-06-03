import type { WatcherDedupeStore } from '../dedupe/watcher-dedupe-store.js';
import { logError, logInfo } from '../log.js';
import type { JobQueue } from '../queue/job-queue.js';
import type { GlobalPackageRegistry } from '../packages/global-package-registry.js';
import { buildThunderstoreDedupeKey } from './thunderstore-dedupe.js';
import type { ThunderstoreClient } from './thunderstore-client.js';

export class ThunderstoreWatcher {
  private readonly lastSeen = new Map<string, string>();

  constructor(
    private readonly registry: GlobalPackageRegistry,
    private readonly client: ThunderstoreClient,
    private readonly jobQueue: JobQueue,
    private readonly dedupe: WatcherDedupeStore,
  ) {}

  async checkAllPackages(): Promise<void> {
    const packages = await this.registry.listEffective();
    for (const pkg of packages) {
      const packageKey = `${pkg.namespace}/${pkg.name}`;
      try {
        const latest = await this.client.fetchPackage(pkg.namespace, pkg.name);
        const previous = this.lastSeen.get(packageKey);
        if (previous === latest.version) {
          continue;
        }
        this.lastSeen.set(packageKey, latest.version);
        if (previous === undefined) {
          const dedupeKey = buildThunderstoreDedupeKey(packageKey, latest.version);
          if (await this.dedupe.hasDedupeKey(dedupeKey)) {
            logInfo(
              `[thunderstore] baseline ${packageKey}@${latest.version} (already announced)`,
            );
            continue;
          }
          logInfo(`[thunderstore] first poll ${packageKey}@${latest.version}, queuing announce`);
        }
        await this.jobQueue.enqueue('watcher:thunderstore', 'announce', {
          kind: 'announce',
          packageKey,
          version: latest.version,
        });
        logInfo(`[thunderstore] queued announce ${packageKey}@${latest.version}`);
      } catch (err: unknown) {
        logError(`[thunderstore] poll failed for ${packageKey}`, err);
      }
    }
  }
}
