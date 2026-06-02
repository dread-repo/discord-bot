import type { PrismaClient } from '@prisma/client';

import {
  loadOfficialPackagesManifest,
  type OfficialPackageManifestEntry,
} from '../config/load-bundled.js';
import { getPrisma } from '../db/prisma.js';

export interface EffectivePackage {
  namespace: string;
  name: string;
  isCore: boolean;
  githubRepo: string | null;
  source: 'manifest' | 'database';
}

export class GlobalPackageRegistry {
  constructor(private readonly db: PrismaClient = getPrisma()) {}

  async listEffective(): Promise<EffectivePackage[]> {
    const manifest = await loadOfficialPackagesManifest();
    const fromManifest = manifest.map(manifestEntryToEffective);
    const dbRows = await this.db.globalPackage.findMany();
    const merged = new Map<string, EffectivePackage>();
    for (const pkg of fromManifest) {
      merged.set(packageKey(pkg.namespace, pkg.name), pkg);
    }
    for (const row of dbRows) {
      merged.set(packageKey(row.namespace, row.name), {
        namespace: row.namespace,
        name: row.name,
        isCore: row.isCore,
        githubRepo: row.githubRepo,
        source: 'database',
      });
    }
    return [...merged.values()];
  }

  register(): never {
    throw new Error('GlobalPackageRegistry.register is not implemented until spec 004');
  }
}

function manifestEntryToEffective(entry: OfficialPackageManifestEntry): EffectivePackage {
  return {
    namespace: entry.namespace,
    name: entry.name,
    isCore: entry.isCore,
    githubRepo: entry.githubRepo ?? null,
    source: 'manifest',
  };
}

function packageKey(namespace: string, name: string): string {
  return `${namespace}/${name}`;
}
