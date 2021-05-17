---
'@rocket/cli': minor
---

Every content image in markdown will outputted in multiple widths and formats to ensure small image file sizes while retaining quality.
You can adjust the defaults by setting `imagePresets.responsive`.

```js
export default {
  imagePresets: {
    responsive: {
      widths: [600, 900, 1640],
      formats: ['avif', 'jpeg'],
      sizes: '(min-width: 1024px) 820px, calc(100vw - 40px)',
    },
  },
};
```
