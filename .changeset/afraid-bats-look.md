---
'plugins-manager': minor
---

BREAKING CHANGE: `addPlugin` API changed

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
