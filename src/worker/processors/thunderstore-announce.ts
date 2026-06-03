import type { Processor } from 'bullmq';

import { buildThunderstoreDedupeKey, parsePackageKey } from '../../lib/watchers/thunderstore-dedupe.js';
import {
  githubReleaseUrl,
  thunderstoreVersionUrl,
} from '../../lib/watchers/thunderstore-types.js';
import { logError, logInfo } from '../../lib/log.js';
import type { AnnounceMeta } from '../../lib/messages/announce-meta.js';
import { MAX_BODY_CHARS } from '../../lib/messages/announce-meta.js';
import type { EffectivePackage } from '../../lib/packages/global-package-registry.js';
import type { ChangelogSummarizeJob, ThunderstoreWatchJob } from '../../lib/queue/queue-types.js';
import type { ThunderstoreWorkerDeps } from '../thunderstore-deps.js';

export function createThunderstoreAnnounceProcessor(
  deps: ThunderstoreWorkerDeps,
): Processor<ThunderstoreWatchJob> {
  return async (job) => {
    if (job.data.kind !== 'announce') {
      return;
    }

    const { packageKey, version } = job.data;
    const dedupeKey = buildThunderstoreDedupeKey(packageKey, version);
    if (!(await deps.dedupe.tryInsert(dedupeKey))) {
      logInfo(`[worker] thunderstore announce skipped (dedupe) ${dedupeKey}`);
      return;
    }

    const { namespace, name } = parsePackageKey(packageKey);
    let pkgInfo;
    try {
      pkgInfo = await deps.client.fetchPackage(namespace, name);
    } catch (err: unknown) {
      logError(`[worker] thunderstore announce fetch failed ${packageKey}`, err);
      return;
    }

    const effectivePackages = await deps.registry.listEffective();
    const pkg = effectivePackages.find(
      (row) => row.namespace === namespace && row.name === name,
    );
    if (pkg === undefined) {
      logError(`[worker] thunderstore announce missing registry row ${packageKey}`);
      return;
    }

    const meta = buildAnnounceMeta(
      pkg,
      namespace,
      name,
      version,
      pkgInfo.changelog,
      pkgInfo.dateCreated,
    );
    await resolveBodyAndMaybeSummarize(deps, meta);

    const guilds = await deps.guildConfig.listThunderstoreGuilds();
    for (const guild of guilds) {
      try {
        await deps.discord.postAnnounce(guild.channelId, guild.pingRoleId, meta);
      } catch (err: unknown) {
        logError(`[worker] thunderstore announce post failed guild=${guild.guildId}`, err);
      }
    }
  };
}

function buildAnnounceMeta(
  pkg: EffectivePackage,
  namespace: string,
  name: string,
  version: string,
  changelog: string,
  timestamp: Date,
): AnnounceMeta {
  const packageKey = `${namespace}/${name}`;
  const thunderstoreUrl = thunderstoreVersionUrl(
    pkg.thunderstoreCommunity,
    namespace,
    name,
    version,
  );
  const meta: AnnounceMeta = {
    kind: 'thunderstore',
    label: pkg.isCore ? 'core' : `plugin: ${packageKey}`,
    versionOrRef: version,
    timestamp,
    body: changelog,
    bodyIsLlmSummary: false,
    thunderstoreUrl,
  };
  if (pkg.githubRepo !== null && pkg.githubRepo.length > 0) {
    meta.githubUrl = githubReleaseUrl(pkg.githubRepo, version);
  }
  return meta;
}

async function resolveBodyAndMaybeSummarize(
  deps: ThunderstoreWorkerDeps,
  meta: AnnounceMeta,
): Promise<void> {
  if (meta.body.length <= MAX_BODY_CHARS) {
    return;
  }

  const urls: ChangelogSummarizeJob['urls'] = {};
  if (meta.githubUrl !== undefined) {
    urls.github = meta.githubUrl;
  }
  if (meta.thunderstoreUrl !== undefined) {
    urls.thunderstore = meta.thunderstoreUrl;
  }

  await deps.jobQueue.enqueue('llm:changelog-summarize', 'summarize', {
    source: 'thunderstore',
    fullText: meta.body,
    urls,
    announceMeta: meta as unknown as Record<string, unknown>,
  });

  meta.body = `${meta.body.slice(0, MAX_BODY_CHARS)}\n\n_(Changelog truncated; full text on Thunderstore.)_`;
}
