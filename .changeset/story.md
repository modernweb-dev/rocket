---
'@mdjs/mdjs-story': minor
---

**BREAKING CHANGE** Update to [lit](https://lit.dev/) 2

If your main lit-html version is 1.x be sure to import html for your story rendering from `@mdjs/mdjs-story`.

````md
```js script
import { html } from '@mdjs/mdjs-story';
```

```js story
export const foo = () => html`<demo-element></demo-element>`;
```
````
