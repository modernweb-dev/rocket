# plugins-manager

## 0.2.0

### Minor Changes

- a8c7173: Changes to `metaConfigToWebDevServerConfig`:

  - Renamed `wrapperFunction` to `rollupWrapperFunction`
  - Adds `setupRollupPlugins` which means those plugins are treated as rollup plugins and they will be wrapped by `rollupWrapperFunction` (if provided)
  - Plugins added via `setupPlugins` will no longer be wrapped
  - If you provide `config.plugins` then it will return that directly ignoring `setupPlugins` and `setupRollupPlugins`

  Changes to `metaConfigToRollupConfig`:

  - If you provide `config.plugins` then it will return that directly ignoring `setupPlugins`

## 0.1.0

### Minor Changes

- b9a6274: First initial release
