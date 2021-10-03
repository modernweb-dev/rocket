# @rocket/blog

## 0.4.0

### Minor Changes

- 70bb7a1: BREAKING CHANGE: Update to latest plugins manager to get type safe options

  There is no longer a name string as a key for a plugin. It is identified by it's function/class. You will need to adjust your code if you are adding or adjusting plugins.

  ```diff
  - addPlugin({ name: 'my-plugin', plugin: myPlugin, options: { myFlag: true }, location: 'top' });
  + addPlugin(myPlugin, { myFlag: true }, { location: 'top' });
  - adjustPluginOptions('my-plugin', { myFlag: true });
  + adjustPluginOptions(myPlugin, { myFlag: true });
  ```

  For more details please see the [Changelog](https://github.com/modernweb-dev/rocket/blob/main/packages/plugins-manager/CHANGELOG.md#030) of the plugins-manager package.

### Patch Changes

- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
- Updated dependencies [70bb7a1]
  - plugins-manager@0.3.0

## 0.3.3

### Patch Changes

- e1089c5: add title to blog page

## 0.3.2

### Patch Changes

- 00f4a91: alignment + spacings for article grids

## 0.3.1

### Patch Changes

- a5661b8: Updates dependencies

## 0.3.0

### Minor Changes

- 8bdc326: Adopt to new layout system

  BREAKING CHANGE:

  - Renamed `blog` to `layout-blog-overview`
  - Renamed `post` to `layout-blog-details`

## 0.2.0

### Minor Changes

- 4858271: Adjust templates for change in `@rocket/eleventy-plugin-mdjs-unified` as it now returns html directly instead of an object with html, js, stories

## 0.1.1

### Patch Changes

- Updated dependencies [a8c7173]
  - plugins-manager@0.2.0

## 0.1.0

### Minor Changes

- 1971f5d: Initial Release
