import { z } from 'zod';

const versionSchema = z.object({
  version_number: z.string(),
  changelog: z.string().nullable().optional(),
  description: z.string().optional(),
  date_created: z.string().optional(),
});

const packageResponseSchema = z.object({
  latest: versionSchema.optional(),
  versions: z.array(versionSchema).optional(),
});

export type ThunderstorePackageResponse = z.infer<typeof packageResponseSchema>;

export interface ThunderstoreLatestVersion {
  version: string;
  changelog: string;
  dateCreated: Date;
}

export function parseThunderstorePackageResponse(data: unknown): ThunderstoreLatestVersion {
  const parsed = packageResponseSchema.parse(data);
  const versionRow = parsed.latest ?? parsed.versions?.[0];
  if (versionRow === undefined) {
    throw new Error('Thunderstore package has no versions');
  }
  const dateCreated =
    versionRow.date_created !== undefined ? new Date(versionRow.date_created) : new Date();
  return {
    version: versionRow.version_number,
    changelog: versionRow.changelog ?? versionRow.description ?? '',
    dateCreated,
  };
}

export function thunderstoreVersionUrl(
  community: string,
  namespace: string,
  name: string,
  version: string,
): string {
  return `https://thunderstore.io/c/${community}/p/${namespace}/${name}/v/${version}/`;
}

export function githubReleaseUrl(repo: string, version: string): string {
  return `https://github.com/${repo}/releases/tag/${version}`;
}
