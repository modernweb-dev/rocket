# plugins-manager

## 0.2.4

### Patch Changes

- 61bb700: Fix types

## 0.2.3

### Patch Changes

- 9978ea7: Improves typings for `addPlugin`

## 0.2.2

### Patch Changes

- 56fdb0c: Optional parameters are now also define as optional in types

## 0.2.1

### Patch Changes

- be0d0b3: fix: add missing main entry to the packages

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
