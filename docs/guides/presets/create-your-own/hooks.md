# Presets >> Create your Own >> Hooks || 20

Your preset can hook into the rocket lifecycle by specifying a function for `before11ty`. This function runs before 11ty calls it's write method. If it is an async function, Rocket will await it's promise.

<!-- prettier-ignore-start -->
```js
/** @type {import('@rocket/cli').RocketPreset} */
export default ({
  async before11ty() {
    await copyDataFiles();
  },
});
```
<!-- prettier-ignore-end -->

## Preset Interface

The full preset interface is copied below for your reference.

```ts
{% include ../../../../packages/cli/types/preset.d.ts %}
```
