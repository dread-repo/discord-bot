# Contract: Platform module interfaces

Cross-cutting APIs feature specs must use instead of ad hoc Discord/DB/queue access.

## GuildConfigStore

```ts
interface GuildConfigStore {
  getGuild(guildId: string): Promise<GuildConfig | null>;
  upsertGuild(data: UpsertGuildConfig): Promise<GuildConfig>;
  isBotAdmin(guildId: string, userId: string): Promise<boolean>;
  grantBotAdmin(guildId: string, userId: string): Promise<void>;
  revokeBotAdmin(guildId: string, userId: string): Promise<void>;
}
```

Thunderstore/GitHub/forum sub-config methods added in spec 003; 002 may expose typed placeholders.

## WatcherDedupeStore

```ts
interface WatcherDedupeStore {
  tryInsert(dedupeKey: string): Promise<boolean>; // true if inserted, false if duplicate
}
```

## GlobalPackageRegistry

```ts
interface GlobalPackageRegistry {
  listEffective(): Promise<EffectivePackage[]>;
  register(/* spec 004 */): never; // throws NotImplemented in 002
}
```

`EffectivePackage` merges `config/official-packages.json` with `global_packages` rows.

## JobQueue

```ts
interface JobQueue {
  enqueue<T>(queueName: QueueName, jobName: string, data: T, opts?: JobsOptions): Promise<string>;
}

type QueueName =
  | 'watcher:thunderstore'
  | 'watcher:github'
  | 'llm:changelog-summarize'
  | 'llm:announcement-review'
  | 'forum:post-pipeline'
  | 'index:repo-scan'
  | 'llm:dread-reply';
```

Payload shapes: [001 job-queues.md](../../001-dread-community-bot/contracts/job-queues.md).

Worker registers `Worker` per queue with concurrency table from same contract.

## ContainerMessageBuilder

```ts
function buildAnnounceContainer(meta: AnnounceMeta): MessageCreateOptions;
```

Layout: [001 container-message.md](../../001-dread-community-bot/contracts/container-message.md).

## LlmGateway

```ts
interface LlmGateway {
  budgetOk(): Promise<boolean>;
  complete(input: LlmRequest): Promise<LlmResponse>;
}
```

002: `complete` rejects or returns stub when `LLM_API_KEY` unset.

## InteractionRouter

```ts
interface InteractionRouter {
  register(command: SlashCommandJSON, handler: InteractionHandler): void;
  dispatch(interaction: ChatInputCommandInteraction): Promise<void>;
}
```

Handlers must `deferReply` or `reply` within 3 seconds; heavy work via `JobQueue.enqueue`.

## Platform constants

```ts
export const OFFICIAL_GUILD_ID = '1510452344024727775';
export const GITHUB_REPO = 'dread-repo/dreadREPO';
```
