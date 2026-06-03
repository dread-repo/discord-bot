import type { PrismaClient } from '@prisma/client';

import {
  loadOfficialPackagesManifest,
  type OfficialPackageManifestEntry,
} from '../config/load-bundled.js';
import { THUNDERSTORE_COMMUNITY } from '../constants.js';
import { getPrisma } from '../db/prisma.js';

export interface EffectivePackage {
  namespace: string;
  name: string;
  isCore: boolean;
  githubRepo: string | null;
  thunderstoreCommunity: string;
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
        thunderstoreCommunity: THUNDERSTORE_COMMUNITY,
        source: 'database',
      });
    }
    return [...merged.values()];
  }

  async register(input: {
    namespace: string;
    name: string;
    isCore: boolean;
    githubRepo?: string | null;
    registeredBy: string;
  }): Promise<EffectivePackage> {
    try {
      const row = await this.db.globalPackage.create({
        data: {
          namespace: input.namespace,
          name: input.name,
          isCore: input.isCore,
          githubRepo: input.githubRepo ?? null,
          registeredBy: input.registeredBy,
        },
      });
      return {
        namespace: row.namespace,
        name: row.name,
        isCore: row.isCore,
        githubRepo: row.githubRepo,
        thunderstoreCommunity: THUNDERSTORE_COMMUNITY,
        source: 'database',
      };
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === 'P2002'
      ) {
        throw new DuplicateGlobalPackageError(input.namespace, input.name);
      }
      throw err;
    }
  }
}

export class DuplicateGlobalPackageError extends Error {
  constructor(namespace: string, name: string) {
    super(`Package ${namespace}/${name} is already registered globally`);
    this.name = 'DuplicateGlobalPackageError';
  }
}

function manifestEntryToEffective(entry: OfficialPackageManifestEntry): EffectivePackage {
  return {
    namespace: entry.namespace,
    name: entry.name,
    isCore: entry.isCore,
    githubRepo: entry.githubRepo ?? null,
    thunderstoreCommunity: entry.thunderstoreCommunity ?? THUNDERSTORE_COMMUNITY,
    source: 'manifest',
  };
}

function packageKey(namespace: string, name: string): string {
  return `${namespace}/${name}`;
}
