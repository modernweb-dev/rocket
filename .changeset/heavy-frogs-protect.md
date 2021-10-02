---
'@rocket/blog': minor
'@rocket/building-rollup': minor
'@rocket/cli': minor
'@rocket/launch': minor
'@mdjs/core': minor
'@rocket/search': minor
---

BREAKING CHANGE: Update to latest plugins manager to get type safe options

There is no longer a name string as a key for a plugin. It is identified by it's function/class. You will need to adjust your code if you are adding or adjusting plugins.

```diff
- addPlugin({ name: 'my-plugin', plugin: myPlugin, options: { myFlag: true }, location: 'top' });
+ addPlugin(myPlugin, { myFlag: true }, { location: 'top' });
- adjustPluginOptions('my-plugin', { myFlag: true });
+ adjustPluginOptions(myPlugin, { myFlag: true });
```

For more details please see the [Changelog](https://github.com/modernweb-dev/rocket/blob/main/packages/plugins-manager/CHANGELOG.md#030) of the plugins-manager package.
