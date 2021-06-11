---
'@mdjs/mdjs-preview': minor
---

**BREAKING CHANGE** Render stories to light dom

```js
export const story = html`<p>my story</p>`;
```

```html
<!-- before -->
<mdjs-preview>
  #shadow-root (open)
    <div id="wrapper">
      <div>
        <p>my story</p>
      </div>
    </div>
    <!-- more internal dom -->

  <code><!-- ... --></code>
</mdjs-preview>

<!-- after -->
<mdjs-preview>
  #shadow-root (open)
    <div id="wrapper">
    <!-- more internal dom -->

  <code><!-- ... --></code>
  <div slot="story">
    <p>my story</p>
  </div>
</mdjs-preview>
```
