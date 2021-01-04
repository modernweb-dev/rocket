---
'plugins-manager': minor
---

Changes to `metaConfigToWebDevServerConfig`:

- Renamed `wrapperFunction` to `rollupWrapperFunction`
- Adds `setupRollupPlugins` which means those plugins are treated as rollup plugins and they will be wrapped by `rollupWrapperFunction` (if provided)
- Plugins added via `setupPlugins` will no longer be wrapped
- If you provide `config.plugins` then it will return that directly ignoring `setupPlugins` and `setupRollupPlugins`

Changes to `metaConfigToRollupConfig`:

- If you provide `config.plugins` then it will return that directly ignoring `setupPlugins`
