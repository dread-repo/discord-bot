# Contract: `/plugin register`

**Handler**: `src/bot/handlers/plugin-register.ts`  
**Permission**: `PermissionResolver` action `globalPluginRegister` (official guild `1510452344024727775` + Administrator)

## Slash command

| Field | Value |
|-------|-------|
| Name | `plugin` |
| Subcommand | `register` |

### Options

| Option | Type | Required |
|--------|------|----------|
| `namespace` | String | yes |
| `name` | String | yes |
| `is_core` | Boolean | no (default false) |

## Behavior

1. Permission check → ephemeral deny if not official guild admin.
2. `GlobalPackageRegistry.register({ namespace, name, isCore, registeredBy: userId })`.
3. Ephemeral success: package will be watched on next poll.

## Errors (ephemeral)

- Duplicate `(namespace, name)` in `global_packages`
- Permission denied
- DB failure
