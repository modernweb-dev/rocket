---
'@mdjs/mdjs-story': minor
---

**BREAKING CHANGE** Render stories to light dom

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
