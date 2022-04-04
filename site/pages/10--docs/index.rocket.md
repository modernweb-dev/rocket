```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/index.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // client-only components
  // 'rocket-search': () => import('@rocket/search/web').then(m => m.RocketSearch),
  // 'rocket-drawer': () => import('@rocket/drawer').then(m => m.RocketDrawer),
}
/* END - Rocket auto generated - do not touch */

import { pageTree } from '../__shared/pageTree.js';
import { ChildListMenu } from '@rocket/engine';

export const menuLinkText = 'Docs';
export const subTitle = 'From zero to hero';
```

# Learning Rocket

Rocket helps you generate static pages from Markdown files while giving you the flexibility to sprinkle in some JavaScript where needed.

<div>${pageTree.renderMenu(new ChildListMenu(), sourceRelativeFilePath)}</div>
