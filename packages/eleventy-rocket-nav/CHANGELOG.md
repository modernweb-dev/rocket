# @rocket/eleventy-rocket-nav

## 0.3.0

### Minor Changes

- ef8ebb0: To support dynamically created content to be part of the anchor navigation of the page we now analyze the final html output instead of `entry.templateContent`.

  BREAKING CHANGE:

  - only add anchors for the currently active pages (before it added anchor for every page)

## 0.2.1

### Patch Changes

- 897892d: bump dependencies

## 0.2.0

### Minor Changes

- 4858271: Adjust templates for change in `@rocket/eleventy-plugin-mdjs-unified` as it now returns html directly instead of an object with html, js, stories

## 0.1.0

### Minor Changes

- 1971f5d: Initial Release
