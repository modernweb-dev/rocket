# Presets >> Create your own > Options || 10

Your preset can hook into the rocket lifecycle by specifying a function for `before11ty`. This function runs before 11ty calls it's write method. If it is an async function, Rocket will await it's promise.

```js
export default {
  async before11ty() {
    await copyDataFiles();
  },
};
```
