# @rocket/cli

## 0.9.5

### Patch Changes

- 1b9559f: Adds `before11ty` hook to config and presets

## 0.9.4

### Patch Changes

- 2b5c61d: Allow configuring the imagePreset ignore rules via the option `ignore`

  ```js
  export default {
    imagePresets: {
      responsive: {
        // ...
        ignore: ({ src }) =>
          src.endsWith('.jpeg') || src.endsWith('svg') || src.includes('rocket-unresponsive.'),
      },
    },
  };
  ```

- 2b5c61d: Do not generate responsive images for files ending in `.svg` or that include `rocket-ignore.`
- ce0b00e: don't transform external images
- 3b1a0cf: Allow to configure check-html-links

  ```js
  export default {
    checkLinks: {
      /* ... */
    },
  };
  ```

## 0.9.3

### Patch Changes

- 795a361: The server worker url should respect a set pathPrefix.

## 0.9.2

### Patch Changes

- 5330740: When replacing images with responsive picture tags do this from the bottom up so the initial dom parsing locations still hold true.

## 0.9.1

### Patch Changes

- 43a7ca1: Responsive images need to respect a set pathPrefix

## 0.9.0

### Minor Changes

- eae2007: Update to mdjs version that uses lit 2 and renders stories to light dom

### Patch Changes

- Updated dependencies [eae2007]
  - @rocket/eleventy-plugin-mdjs-unified@0.5.0

## 0.8.2

### Patch Changes

- 60e85a1: Support `picture` tags by handling `source` tags with `srcset` attributes in the rollup asset gathering build phase.
- Updated dependencies [60e85a1]
  - @rocket/building-rollup@0.3.1

## 0.8.1

### Patch Changes

- c338696: Updated dependency of eleventy-img for M1 compatibility

## 0.8.0

### Minor Changes

- 8bba4a8: Every content image in markdown will outputted in multiple widths and formats to ensure small image file sizes while retaining quality.
  You can adjust the defaults by setting `imagePresets.responsive`.

  ```js
  export default {
    imagePresets: {
      responsive: {
        widths: [600, 900, 1640],
        formats: ['avif', 'jpeg'],
        sizes: '(min-width: 1024px) 820px, calc(100vw - 40px)',
      },
    },
  };
  ```

## 0.7.0

### Minor Changes

- 2724f07: The service worker no longer precaches all urls and assets. It now

  - caches already visited pages
  - caches assets of visited pages (up to 100 files then it replaces older entries)
  - on service worker activation it will reload the page if a newer version is available

### Patch Changes

- Updated dependencies [2724f07]
  - @rocket/building-rollup@0.3.0

## 0.6.3

### Patch Changes

- 2b7f1ee: Add support for pathprefix
- Updated dependencies [2b7f1ee]
  - @rocket/eleventy-plugin-mdjs-unified@0.4.1

## 0.6.2

### Patch Changes

- ed86ff2: Do not set `data-localize-lang` in the simulator iframe html tag
- f4a0ab5: Pass document shadowRoot to iframe
- c675820: fix: windows path issue avoid filtering of index section of collections

## 0.6.1

### Patch Changes

- abc8a02: You can now use an absolute path for the rootDir
- Updated dependencies [bad4686]
- Updated dependencies [2267e72]
  - @rocket/building-rollup@0.2.0
  - @rocket/eleventy-plugin-mdjs-unified@0.4.0

## 0.6.0

### Minor Changes

- 5edc40f: Make sure each rocket instance has it's own eleventy config'
- ef8ebb0: To support dynamically created content to be part of the anchor navigation of the page we now analyze the final html output instead of `entry.templateContent`.

  BREAKING CHANGE:

  - only add anchors for the currently active pages (before it added anchor for every page)

### Patch Changes

- be0d0b3: fix: add missing main entry to the packages
- Updated dependencies [be0d0b3]
- Updated dependencies [ef8ebb0]
  - @rocket/building-rollup@0.1.3
  - check-html-links@0.2.1
  - @rocket/core@0.1.2
  - plugins-manager@0.2.1
  - @rocket/eleventy-rocket-nav@0.3.0

## 0.5.2

### Patch Changes

- 8e095b7: Watching `_assets`, `_data`, `_includes` for changes to trigger updated automatically

## 0.5.1

### Patch Changes

- f44a0f4: Rewrite dynamic imports with "`"
- 74f7ddf: Adds performance improvements for social media images by:
  - creating social media images only in `rocket build` phase
  - adds a config `createSocialMediaImages` to enable (default) or disable it globally
  - adds config `start.createSocialMediaImages` to enable or disable (default) it during `rocket start`
- 750418b: Use class-based node API of check-html-links
- Updated dependencies [f44a0f4]
- Updated dependencies [750418b]
  - @rocket/eleventy-plugin-mdjs-unified@0.3.1
  - check-html-links@0.2.0

## 0.5.0

### Minor Changes

- 8bdc326: Adds html to core presets with the following Layouts:

  - `layout-raw` No html or any wrapping (use it for xml, json, ... outputs)
  - `layout-default` For content
  - `layout-index` Extends content and adds an "Open Navigation" button for mobile

  Layout Default has the following Joining Blocks:

  - `head` For the html `<head>`
  - `header` Within the top `<header>`
  - `content` Html within the main content section
  - `footer` Within to bottom `<footer>`
  - `bottom` Add the end of the body

  BREAKING CHANGES:

  - `layout` renamed to `layout-default`
  - Automatically sets `layout-index` for all `index.md` files

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
