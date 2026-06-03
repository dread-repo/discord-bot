import type { Processor } from 'bullmq';

import { GITHUB_REPO } from '../../lib/constants.js';
import { githubEventsSchema } from '../../lib/config/github-events.js';
import { buildGithubDedupeKey } from '../../lib/watchers/github-dedupe.js';
import { mappedToAnnounceMeta } from '../../lib/watchers/github-event-mapper.js';
import type { MappedGithubEvent } from '../../lib/watchers/github-types.js';
import { thunderstoreVersionUrl } from '../../lib/watchers/thunderstore-types.js';
import { logError, logInfo } from '../../lib/log.js';
import type { AnnounceMeta } from '../../lib/messages/announce-meta.js';
import { MAX_BODY_CHARS } from '../../lib/messages/announce-meta.js';
import type { GlobalPackageRegistry } from '../../lib/packages/global-package-registry.js';
import type { ChangelogSummarizeJob, GitHubWatchJob } from '../../lib/queue/queue-types.js';
import type { GithubWorkerDeps } from '../github-deps.js';

export function createGithubAnnounceProcessor(
  deps: GithubWorkerDeps,
): Processor<GitHubWatchJob> {
  return async (job) => {
    const { mapped, deliveryId, event } = job.data;
    const dedupeKey = buildGithubDedupeKey(deliveryId);
    if (!(await deps.dedupe.tryInsert(dedupeKey))) {
      logInfo(`[worker] github announce skipped (dedupe) ${dedupeKey}`);
      return;
    }

    await enrichReleaseThunderstoreUrl(mapped, deps.registry);
    const meta = mappedToAnnounceMeta(mapped);
    await resolveBodyAndMaybeSummarize(deps, meta);

    const guilds = await deps.guildConfig.listGithubGuilds();
    for (const guild of guilds) {
      const events = githubEventsSchema.parse(guild.events);
      if (!events[event]) {
        continue;
      }
      try {
        await deps.discord.postAnnounceWithoutPing(guild.channelId, meta);
      } catch (err: unknown) {
        logError(`[worker] github announce post failed guild=${guild.guildId}`, err);
      }
    }
  };
}

async function enrichReleaseThunderstoreUrl(
  mapped: MappedGithubEvent,
  registry: GlobalPackageRegistry,
): Promise<void> {
  if (mapped.event !== 'release') {
    return;
  }
  const packages = await registry.listEffective();
  const core = packages.find((pkg) => pkg.isCore && pkg.githubRepo === GITHUB_REPO);
  if (core === undefined) {
    return;
  }
  mapped.thunderstoreUrl = thunderstoreVersionUrl(
    core.thunderstoreCommunity,
    core.namespace,
    core.name,
    mapped.versionOrRef,
  );
}

async function resolveBodyAndMaybeSummarize(
  deps: GithubWorkerDeps,
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
    source: 'github',
    fullText: meta.body,
    urls,
    announceMeta: meta as unknown as Record<string, unknown>,
  });

  meta.body = `${meta.body.slice(0, MAX_BODY_CHARS)}\n\n_(Changelog truncated; full text on GitHub.)_`;
}
