# @rocket/cli

## 0.1.2

### Patch Changes

- 641c7e5: Add a pathPrefix option to allow deployment to a subdirectory

## 0.1.1

### Patch Changes

- a8c7173: Changes to config:
  - Do not auto rollupWrap plugins added via `setupDevPlugins`.
  - If you provide `devServer.plugins` then it will return that directly ignoring `setupDevAndBuildPlugins` and `setupDevPlugins`
- Updated dependencies [a8c7173]
  - plugins-manager@0.2.0

## 0.1.0

### Minor Changes

- 1971f5d: Initial Release

### Patch Changes

- Updated dependencies [1971f5d]
  - @rocket/building-rollup@0.1.0
  - @rocket/core@0.1.0
  - @rocket/eleventy-plugin-mdjs-unified@0.1.0
  - @rocket/eleventy-rocket-nav@0.1.0
