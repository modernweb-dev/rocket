---
'@rocket/cli': patch
---

In `rocket.config.js` you can now supply a rollup config function.

```js
export default {
  rollup: config => {
    // config will be the fully generated config object after all presets have been applied
    if (config.plugins.includes('...')) {
      // change some config options
    }
    return config;
  }
}
