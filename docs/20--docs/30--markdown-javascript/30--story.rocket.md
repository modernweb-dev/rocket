```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--docs/30--markdown-javascript/30--story.rocket.md';
import { pageTree, setupUnifiedPlugins, footerMenu, layout } from '../../recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu, layout };
/* END - Rocket auto generated - do not touch */
```

# Story

You can showcase live running code by annotating a code block with `js story`.

```js script
import { html } from '@mdjs/mdjs-story';
```

````md
```js script
import { html } from '@mdjs/mdjs-story';
```

```js story
export const foo = () => html` <p>my html</p> `;
```
````

will result in

```js story
export const foo = () => html` <p>my html</p> `;
```
