```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '30--tools/index.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */

import { pageTree } from '../__shared/pageTree.js';
import { ChildListMenu } from '@rocket/engine';

export const menuLinkText = 'Tools';
```

# Tools

Rocket makes use of various tools which can be used independently as well. You can find it's documentation here.

<div>${pageTree.renderMenu(new ChildListMenu(), sourceRelativeFilePath)}</div>

## Contents

- [Configuration](./configuration/)
  - [Overview](./configuration/overview/)
  - [Computed Config](./configuration/computed-config/)
  - [Service Worker](./configuration/service-worker/)
  - [Images](./configuration/images/)
- [Presets](./presets/)
  - [Joining Blocks](./presets/joining-blocks/)
  - [`@rocket/launch`](./presets/launch/)
  - [`@rocket/search`](./presets/search/)
  - [`@rocket/blog`](./presets/blog/)
- [Markdown JavaScript](./markdown-javascript/)
  - [Overview](./markdown-javascript/overview/)
  - [Preview](./markdown-javascript/preview/)
  - [Story](./markdown-javascript/story/)
- [Eleventy Plugins](./eleventy-plugins/)
  - [Markdown JavaScript (mdjs)](./eleventy-plugins/mdjs-unified/)
- [Tools](./tools/)
  - [Plugins Manager](./tools/plugins-manager/)
  - [Rollup Config](./tools/rollup-config/)
  - [Check HTML Links ](./tools/check-html-links/)
