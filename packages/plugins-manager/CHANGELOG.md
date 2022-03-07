# plugins-manager

## 0.3.1

### Patch Changes

- 7e277cd: Add a "hidden" feature in addPlugin that if you attach a `wrapPlugin` property to the returning function it will call `wrapPlugin` on the plugin before adding it.

## 0.3.0

### Minor Changes

- 70bb7a1: BREAKING CHANGE: `addPlugin` API changed

  ```diff
  - addPlugin({ name: 'my-plugin', plugin: myPlugin, options: { myFlag: true }, location: 'top' });
  + addPlugin(myPlugin, { myFlag: true }, { location: 'top' });
  ```

  This is now type safe and typescript will throw an error if you pass the wrong type.

  ```js
  function myPlugin({ myFlag = false } = {}) {
    // ...
  }

  addPlugin(myPlugin, { myFlag: true }); // ts ok
  addPlugin(myPlugin, { notExisting: true }); // ts error
  ```

- 70bb7a1: BREAKING CHANGE: `adjustPluginOptions` API changed

  ```diff
  - adjustPluginOptions('my-plugin', { myFlag: true });
  + adjustPluginOptions(myPlugin, { myFlag: true });
  ```

  This is now type safe and typescript will throw an error if you pass the wrong type.

  ```js
  function myPlugin({ myFlag = false } = {}) {
    // ...
  }

  adjustPluginOptions(myPlugin, { myFlag: true }); // ts ok
  adjustPluginOptions(myPlugin, { notExisting: true }); // ts error
  ```

- 70bb7a1: Add `removePlugin` functionality

  ```js
  export default {
    setupPlugins: [removePlugin(json)],
  };
  ```

- 70bb7a1: BREAKING CHANGE: `metaConfigToRollupConfig` has been renamed to `applyPlugins`

  ```diff
  - const finalConfig = metaConfigToRollupConfig(currentConfig, defaultMetaPlugins);
  + const finalConfig = applyPlugins(currentConfig, defaultMetaPlugins);
  ```

- 70bb7a1: BREAKING CHANGE: `metaConfigToWebDevServerConfig` has been removed
- 70bb7a1: Plugins can now be classes as well. The options are passed to the constructor.

  ```js
  /**
   * @typedef {object} MyClassOptions
   * @property {string} lastName
   */

  class MyClass {
    /** @type {MyClassOptions} */
    options = {
      lastName: 'initial-second',
    };

    /**
     * @param {Partial<MyClassOptions>} options
     */
    constructor(options = {}) {
      this.options = { ...this.options, ...options };
    }
  }

  export default {
    setupPlugins: [addPlugin(MyClass)],
  };

  // constructor parameters are type safe
  addPlugin(MyClass, { lastName: 'new name' }); // ts ok
  addPlugin(MyClass, { otherProp: 'new name' }); // ts error
  ```

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
