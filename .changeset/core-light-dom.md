---
'@mdjs/core': minor
---

**BREAKING CHANGE** Stories of `story` and `preview-story` are now rendered to light dom instead of shadow dom to allow usage of a scoped registry for the internal dom

```js
export const story = html`<p>my story</p>`;
```

```html
<!-- before -->
<mdjs-story>
  #shadow-root (open)
    <p>my story</p>
</mdjs-story>

<!-- after -->
<mdjs-story>
  <p>my story</p>
</mdjs-story>
```
