---
'plugins-manager': minor
---

BREAKING CHANGE: `adjustPluginOptions` API changed

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
