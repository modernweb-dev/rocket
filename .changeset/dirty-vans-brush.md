---
'@mdjs/mdjs-preview': minor
---

**BREAKING CHANGE** Update to [lit](https://lit.dev/) 2

If your main lit-html version is 1.x be sure to import html for your story rendering from `@mdjs/mdjs-preview`.

````md
```js script
import { html } from '@mdjs/mdjs-preview';
```

```js preview-story
export const foo = () => html`<demo-element></demo-element>`;
```
````
