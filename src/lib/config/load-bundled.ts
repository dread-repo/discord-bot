import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const officialPackageSchema = z.object({
  namespace: z.string(),
  name: z.string(),
  isCore: z.boolean(),
  githubRepo: z.string().optional(),
  /** Thunderstore community slug (R.E.P.O. uses `repo`). */
  thunderstoreCommunity: z.string().optional(),
});

const officialPackagesFileSchema = z.object({
  packages: z.array(officialPackageSchema),
});

export type OfficialPackageManifestEntry = z.infer<typeof officialPackageSchema>;

export async function loadOfficialPackagesManifest(): Promise<OfficialPackageManifestEntry[]> {
  const raw = await readFile(path.join(repoRoot, 'config/official-packages.json'), 'utf8');
  const parsed = officialPackagesFileSchema.parse(JSON.parse(raw));
  return parsed.packages;
}

export async function loadDreadPersona(): Promise<string> {
  return readFile(path.join(repoRoot, 'config/dread-persona.md'), 'utf8');
}

export async function loadJsonConfig<T>(filename: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(path.join(repoRoot, 'config', filename), 'utf8');
  return schema.parse(JSON.parse(raw));
}
