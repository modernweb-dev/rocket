```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/index.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */

import { pageTree } from '../__shared/pageTree.js';
import { ChildListMenu } from '@rocket/engine';

export const menuLinkText = 'Docs';
```

# Learning Rocket

Rocket helps you generate static pages from Markdown files while giving you the flexibility to sprinkle in some JavaScript where needed.

<div>${pageTree.renderMenu(new ChildListMenu(), sourceRelativeFilePath)}</div>
