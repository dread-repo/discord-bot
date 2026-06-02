import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { getSupabase } from '../config/supabase.js';

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
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

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
    const { error } = await this.db.from('global_packages').insert({
      namespace,
      name,
      is_core: isCore,
      github_repo: githubRepo ?? null,
      registered_by: registeredBy,
    });
    if (error) throw error;
  }

  async listAll(): Promise<GlobalPackage[]> {
    const { data, error } = await this.db
      .from('global_packages')
      .select('namespace, name, is_core, github_repo');
    if (error) throw error;
    const rowSchema = z.object({
      namespace: z.string(),
      name: z.string(),
      is_core: z.boolean(),
      github_repo: z.string().nullable(),
    });
    return rowSchema.array().parse(data).map((row) => ({
      namespace: row.namespace,
      name: row.name,
      isCore: row.is_core,
      githubRepo: row.github_repo,
    }));
  }
}
