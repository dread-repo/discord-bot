import type { Client } from 'discord.js';
import { Events } from 'discord.js';

import type { GuildConfigStore } from '../../lib/config/guild-config-store.js';
import type { JobQueue } from '../../lib/queue/job-queue.js';
import { GlobalPackageRegistry } from '../../lib/packages/global-package-registry.js';
import type { PermissionResolver } from '../../lib/permissions/permission-resolver.js';
import { InteractionRouter } from '../interaction-router.js';
import { createGithubSetupHandler } from './github-setup.js';
import { createPluginRegisterHandler } from './plugin-register.js';
import { createPlatformSmokeHandler } from './platform-smoke.js';
import { createThunderstoreSetupHandler } from './thunderstore-setup.js';

export interface InteractionWireDeps {
  permissions: PermissionResolver;
  store: GuildConfigStore;
  registry?: GlobalPackageRegistry;
}

export function wireInteractionRouter(
  client: Client,
  jobQueue: JobQueue,
  deps: InteractionWireDeps,
): InteractionRouter {
  const router = new InteractionRouter();
  const setupDeps = { permissions: deps.permissions, store: deps.store };

  router.register('platform-smoke', createPlatformSmokeHandler(jobQueue));
  router.register('thunderstore', createThunderstoreSetupHandler(setupDeps));
  router.register('github', createGithubSetupHandler(setupDeps));
  router.register(
    'plugin',
    createPluginRegisterHandler({
      permissions: deps.permissions,
      registry: deps.registry ?? new GlobalPackageRegistry(),
    }),
  );

  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    void router.dispatch(interaction);
  });

  return router;
}
