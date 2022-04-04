```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '30--tools/index.rocket.md';
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
```

# Tools

Rocket makes use of various tools which can be used independently as well. You can find it's documentation here.

## Contents

<div>${pageTree.renderMenu(new ChildListMenu(), sourceRelativeFilePath)}</div>
