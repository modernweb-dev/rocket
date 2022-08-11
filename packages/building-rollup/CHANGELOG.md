# @rocket/building-rollup

## 0.4.1

### Patch Changes

- a22da49: Make sure user provided `developmentMode` actually gets applied.

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

## 0.3.1

### Patch Changes

- 60e85a1: Support `picture` tags by handling `source` tags with `srcset` attributes in the rollup asset gathering build phase.

## 0.3.0

### Minor Changes

- 2724f07: Stop auto generating a service worker from a template. Setup your own and then bundle via `createServiceWorkerConfig`.

## 0.2.0

### Minor Changes

- bad4686: Preserve attributes on script tags. Preserve export names.

## 0.1.3

### Patch Changes

- be0d0b3: fix: add missing main entry to the packages

## 0.1.2

### Patch Changes

- 897892d: bump dependencies

## 0.1.1

### Patch Changes

- 3468ff9: Update rollup-plugin-html to support `absolutePathPrefix` option

## 0.1.0

### Minor Changes

- 1971f5d: Initial Release
