import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { PrismaClient } from '@prisma/client';

import { prisma } from '../db/prisma.js';

export interface GlobalPackage {
  namespace: string;
  name: string;
  isCore: boolean;
  githubRepo: string | null;
}

interface OfficialPackagesFile {
  packages: {
    namespace: string;
    name: string;
    isCore: boolean;
    githubRepo?: string;
  }[];
}

export class GlobalPackageRegistry {
  constructor(private readonly db: PrismaClient = prisma) {}

  async loadBundledDefaults(): Promise<GlobalPackage[]> {
    const filePath = path.join(process.cwd(), 'config', 'official-packages.json');
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as OfficialPackagesFile;
    return parsed.packages.map((p) => ({
      namespace: p.namespace,
      name: p.name,
      isCore: p.isCore,
      githubRepo: p.githubRepo ?? null,
    }));
  }

  async register(
    namespace: string,
    name: string,
    isCore: boolean,
    registeredBy: string,
    githubRepo?: string,
  ): Promise<void> {
    await this.db.globalPackage.create({
      data: {
        namespace,
        name,
        isCore,
        githubRepo: githubRepo ?? null,
        registeredBy,
      },
    });
  }

  async listAll(): Promise<GlobalPackage[]> {
    const rows = await this.db.globalPackage.findMany({
      select: { namespace: true, name: true, isCore: true, githubRepo: true },
    });
    return rows.map((row) => ({
      namespace: row.namespace,
      name: row.name,
      isCore: row.isCore,
      githubRepo: row.githubRepo,
    }));
  }
}
