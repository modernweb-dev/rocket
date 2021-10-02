---
'plugins-manager': minor
---

Plugins can now be classes as well. The options are passed to the constructor.

```js
/**
 * @typedef {object} MyClassOptions
 * @property {string} lastName
 */

class MyClass {
  /** @type {MyClassOptions} */
  options = {
    lastName: 'initial-second'
  }

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
