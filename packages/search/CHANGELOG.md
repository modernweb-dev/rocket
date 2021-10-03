# @rocket/search

## 0.5.0

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

## 0.4.1

### Patch Changes

- a5661b8: Updates dependencies

## 0.4.0

### Minor Changes

- 6cabdba: BREAKING: upgraded search to lit version 2

## 0.3.5

### Patch Changes

- 2b7f1ee: Add support for pathprefix

## 0.3.4

### Patch Changes

- 81edf45: Reduce the amount of js files in the build by avoiding inline script tags

## 0.3.3

### Patch Changes

- 818caad: chore: generalize label & add alt when no img
- 0b64116: Update @lion dependencies

## 0.3.2

### Patch Changes

- 302227e: Add variable for border-radius of SearchCombobox

## 0.3.1

### Patch Changes

- be0d0b3: fix: add missing main entry to the packages
- Updated dependencies [be0d0b3]
  - plugins-manager@0.2.1

## 0.3.0

### Minor Changes

- 8bdc326: Adopt to the new layout system

## 0.2.0

### Minor Changes

- cd22231: Adjustments to work with the restructured CLI Plugin System

## 0.1.2

### Patch Changes

- 897892d: bump dependencies
- 7b2dc64: fix(search): improve a11y

  - a11y: add labels to button
  - ux: replace 'arrow-left' icon with 'x' icon for 'close search' button
  - perf: makes all templates static
  - fix: address typescript errors

## 0.1.1

### Patch Changes

- Updated dependencies [a8c7173]
  - plugins-manager@0.2.0

## 0.1.0

### Minor Changes

- 1971f5d: Initial Release
