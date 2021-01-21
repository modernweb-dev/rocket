# @rocket/cli

## 0.4.1

### Patch Changes

- c92769a: Processing links and asset urls to generate the final html output is now utf8 safe
- 562e91f: Make sure logos do not have "<?xml" in their code

## 0.4.0

### Minor Changes

- 0eb507d: Adds the capability to configure the svg template for the social media images.
- 0eb507d: Adds `setupEleventyComputedConfig` option to enable configuration of 11ty's `eleventyComputed`. The plugins-manager system is used for it.

## 0.3.1

### Patch Changes

- a498a5d: Make sure links to `*index.md` files are not treated as folder index files like `index.md`

## 0.3.0

### Minor Changes

- cd22231: Restructure and simplify Rocket Cli Plugin System

### Patch Changes

- cd22231: Add a default Rocket Cli Plugin which checks all links on every save (during start) and after a production build
- Updated dependencies [cd22231]
- Updated dependencies [cd22231]
  - @rocket/eleventy-plugin-mdjs-unified@0.3.0
  - check-html-links@0.1.0

## 0.2.1

### Patch Changes

- 897892d: bump dependencies
- 295cfbd: Better support for windows paths
- Updated dependencies [897892d]
  - @rocket/building-rollup@0.1.2
  - @rocket/eleventy-rocket-nav@0.2.1

## 0.2.0

### Minor Changes

- ef3b846: Add a default "core" preset to the cli package which provides fundaments like eleventConfig data, eleventyComputed data, logo, site name, simple layout, ...
- 4858271: Process local relative links and images via html (11ty transform) to support all 11ty template systems
- 4858271: Adjust templates for change in `@rocket/eleventy-plugin-mdjs-unified` as it now returns html directly instead of an object with html, js, stories

### Patch Changes

- ef3b846: Move setting of title, eleventyNavigation and section page meta data to eleventyComputed
- ef3b846: Auto create social media images for every page
- Updated dependencies [ef3b846]
- Updated dependencies [4858271]
- Updated dependencies [4858271]
  - @rocket/core@0.1.1
  - @rocket/eleventy-plugin-mdjs-unified@0.2.0
  - @rocket/eleventy-rocket-nav@0.2.0

## 0.1.4

### Patch Changes

- 32f39ae: An updated triggered via watch should not hide the main navgiation.

## 0.1.3

### Patch Changes

- 3468ff9: Pass prefix to rollup-plugin-html so assets can still be extracted
- Updated dependencies [3468ff9]
  - @rocket/building-rollup@0.1.1

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
