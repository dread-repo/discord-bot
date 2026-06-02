# Contract: PermissionResolver

**Module**: `src/lib/permissions/permission-resolver.ts`

## Actions

| Action | Purpose |
|--------|---------|
| `config` | Guild setup commands (003) |
| `moderate` | Ban/kick/warn (008) |
| `globalPluginRegister` | `/global-plugin` (004) |
| `setBotAdmin` | Grant/revoke bot-admin |
| `officialForumRegister` | `/forum register` (007) |

## API

```ts
type PermissionAction =
  | 'config'
  | 'moderate'
  | 'globalPluginRegister'
  | 'setBotAdmin'
  | 'officialForumRegister';

type PermissionContext = {
  guildId: string;
  userId: string;
  memberRoles: string[];
  discordPermissions: bigint; // guild member permissions bitfield
};

function can(
  resolver: PermissionResolver,
  action: PermissionAction,
  ctx: PermissionContext,
): Promise<boolean>;
```

## Rules (normative)

1. **moderate**: User has Discord `BanMembers` or `KickMembers` or `ModerateMembers` in `guildId`, **or** row in `guild_bot_admins` for `(guildId, userId)`. Global admin in official guild does **not** grant moderate in other guilds without (1).
2. **config**: `ManageGuild` or bot-admin row or Administrator.
3. **setBotAdmin**: Administrator in `guildId`.
4. **globalPluginRegister**, **officialForumRegister**: `guildId === OFFICIAL_GUILD_ID` and Administrator (v1; bot-admin in official guild may be added in 003).
5. Deny by default.

## Tests

Matrix file `src/lib/permissions/permission-resolver.test.ts` covers at least:
- Local mod in guild A can moderate in A.
- Official-guild bot-admin cannot moderate in guild B without B rights.
- Non-admin cannot `setBotAdmin`.
