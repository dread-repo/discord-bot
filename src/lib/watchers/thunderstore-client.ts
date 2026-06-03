import { logError } from '../log.js';
import {
  parseThunderstorePackageResponse,
  type ThunderstoreLatestVersion,
} from './thunderstore-types.js';

const API_BASE = 'https://thunderstore.io/api/v1/package';
const MAX_ATTEMPTS = 3;

export class ThunderstoreClient {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async fetchPackage(namespace: string, name: string): Promise<ThunderstoreLatestVersion> {
    const url = `${API_BASE}/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/`;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await this.fetchFn(url);
        if (response.status === 404) {
          throw new Error(`Thunderstore package not found: ${namespace}/${name}`);
        }
        if (!response.ok) {
          throw new Error(`Thunderstore API ${String(response.status)} for ${namespace}/${name}`);
        }
        const json: unknown = await response.json();
        return parseThunderstorePackageResponse(json);
      } catch (err: unknown) {
        lastError = err;
        if (attempt < MAX_ATTEMPTS) {
          await sleep(250 * attempt);
        }
      }
    }

    logError(`[thunderstore] fetch failed for ${namespace}/${name}`, lastError);
    throw lastError;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
