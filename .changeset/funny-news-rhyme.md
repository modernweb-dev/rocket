---
'@mdjs/mdjs-preview': patch
---

The Platform and Size controls are now moved above the preview.
For the web platform we added a special "inline" size.
Only when platform=web & size=webInline it will render to dom.
On all other selections it will render the preview via an iframe.

```js
sizes: [
  {
    key: 'webInline',
    name: 'Inline',
    platform: 'web',
    width: 360,
    height: 640,
    dpr: 1,
  },
  {
    // ...
  },
];
```
