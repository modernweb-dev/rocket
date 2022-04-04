```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '30--tools/20--markdown-javascript/30--story.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // client-only components
  // 'rocket-search': () => import('@rocket/search/web').then(m => m.RocketSearch),
  // 'rocket-drawer': () => import('@rocket/drawer').then(m => m.RocketDrawer),
}
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
