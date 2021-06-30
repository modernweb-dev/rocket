---
'@rocket/cli': patch
---

Allow configuring the imagePreset ignore rules via the option `ignore`

```js
export default {
  imagePresets: {
    responsive: {
      // ...
      ignore: ({ src }) =>
        src.endsWith('.jpeg') || src.endsWith('svg') || src.includes('rocket-unresponsive.'),
    },
  },
};
```
