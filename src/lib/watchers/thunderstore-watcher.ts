import { logError, logInfo } from '../log.js';
import type { JobQueue } from '../queue/job-queue.js';
import type { GlobalPackageRegistry } from '../packages/global-package-registry.js';
import type { ThunderstoreClient } from './thunderstore-client.js';

export class ThunderstoreWatcher {
  private readonly lastSeen = new Map<string, string>();

  constructor(
    private readonly registry: GlobalPackageRegistry,
    private readonly client: ThunderstoreClient,
    private readonly jobQueue: JobQueue,
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
          logInfo(`[thunderstore] baseline ${packageKey}@${latest.version}`);
          continue;
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
