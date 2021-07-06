# @rocket/launch

## 0.5.3

### Patch Changes

- b7d5cba: remove footer extra comma

## 0.5.2

### Patch Changes

- 9e3c2f5: Only show the help & feedback link if a site.helpUrl is defined
- 9625b94: Remove footer urls to pages that users would need to create
- 1f79d7a: Add font-family CSS variables

  - `--primary-font-family` for body text
  - `--secondary-font-family` for emphasis (e.g. call-to-action)
  - `--heading-font-family` for headings (defaults to `--primary-font-family`)
  - `--monospace-font-family` for code blocks

## 0.5.1

### Patch Changes

- cf44221: Adds a Slack invite to social links
- f5d349e: add used fonts from google fonts

## 0.5.0

### Minor Changes

- 8bba4a8: Configure responsive image sizes to align with the launch preset breakpoints.
  The set value is `sizes: '(min-width: 1024px) 820px, calc(100vw - 40px)'`.

## 0.4.2

### Patch Changes

- 2b7f1ee: Add support for pathprefix

## 0.4.1

### Patch Changes

- 81edf45: Reduce the amount of js files in the build by avoiding inline script tags

## 0.4.0

### Minor Changes

- 8eec69f: Introduces the following layouts:

  - `layout-404` A space not found page
  - `layout-home` Frontpage with center logo below text
  - `layout-home-background` Frontpage with left text and background image on the right
  - `layout-sidebar` Left sidebar, right content
  - `layout-index` Extends layout-sidebar

  BREAKING CHANGES:

  - Sets `layout-sidebar` as the default layout
  - Removed dedicated Layout setting for `layout-home` use `layout-home-background` instead
  - Renamed `404.njk` to `layout-404`
  - Renamed `layout.njk` to `layout-sidebar`
  - Renamed `pure-content.njk` to `layout-raw`
  - Renamed `with-index.njk` to `layout-index`
  - Renamed `with-sidebar.njk` to `layout-sidebar`
  - Renamed `home.njk` to `layout-home`

### Patch Changes

- Updated dependencies [8bdc326]
  - @rocket/navigation@0.2.0

## 0.3.0

### Minor Changes

- cd22231: Adjustments to work with the restructured CLI Plugin System

### Patch Changes

- cd22231: Move `noscript.css` into `_assets/_static` as it does not get detected/moved automatically by `@web/rollup-plugin-html`.

## 0.2.1

### Patch Changes

- 86c3a4b: adds themable CSS custom properties to <inline-notification>
- 7dd6f4c: Make default logo work with auto generating social media images
- Updated dependencies [897892d]
  - @rocket/drawer@0.1.2

## 0.2.0

### Minor Changes

- ef3b846: Add a default "core" preset to the cli package which provides fundaments like eleventConfig data, eleventyComputed data, logo, site name, simple layout, ...
- 4858271: Adjust templates for change in `@rocket/eleventy-plugin-mdjs-unified` as it now returns html directly instead of an object with html, js, stories

### Patch Changes

- 25adb74: feat(launch): add icons for discord and telegram

## 0.1.2

### Patch Changes

- 496a1b0: Improves accessibility of the 404 page

## 0.1.1

### Patch Changes

- 3468ff9: Do not double url social media images
- Updated dependencies [d955b43]
  - @rocket/drawer@0.1.1

## 0.1.0

### Minor Changes

- 1971f5d: Initial Release

### Patch Changes

- Updated dependencies [1971f5d]
  - @rocket/drawer@0.1.0
  - @rocket/navigation@0.1.0
