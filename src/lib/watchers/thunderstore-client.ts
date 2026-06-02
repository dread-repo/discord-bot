import { logger } from '../log.js';

export interface ThunderstoreLatestVersion {
  namespace: string;
  name: string;
  version: string;
  description: string;
  dateCreated: Date;
  thunderstoreUrl: string;
  websiteUrl?: string;
}

interface ExperimentalPackageResponse {
  latest?: {
    version_number?: string;
    description?: string;
    date_created?: string;
    website_url?: string;
  };
}

export async function fetchLatestPackageVersion(
  namespace: string,
  name: string,
): Promise<ThunderstoreLatestVersion | null> {
  const url = `https://thunderstore.io/api/experimental/package/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/`;
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    logger.error('Thunderstore API request failed', {
      namespace,
      name,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }

  if (response.status === 404) {
    logger.debug('Thunderstore package not found', { namespace, name });
    return null;
  }

  if (!response.ok) {
    logger.warn('Thunderstore API error', {
      namespace,
      name,
      status: response.status,
    });
    return null;
  }

  const body = (await response.json()) as ExperimentalPackageResponse;
  const latest = body.latest;
  const version = latest?.version_number;
  if (!version) return null;

  const thunderstoreUrl = `https://thunderstore.io/package/${namespace}/${name}/${version}/`;
  const websiteUrl =
    typeof latest.website_url === 'string' && latest.website_url.length > 0
      ? latest.website_url
      : undefined;

  const result: ThunderstoreLatestVersion = {
    namespace,
    name,
    version,
    description: latest.description ?? '',
    dateCreated: latest.date_created ? new Date(latest.date_created) : new Date(),
    thunderstoreUrl,
  };
  if (websiteUrl) result.websiteUrl = websiteUrl;
  return result;
}
