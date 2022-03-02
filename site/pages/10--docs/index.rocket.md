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

- [First Pages](./first-pages/getting-started/) Learn how to bootstrap and run a Rocket site
  - [Adding Pages](./first-pages/adding-pages/) Create your own content pages
  - [Linking](./first-pages/link-to-other-pages/) Link between yuor markdown pages
  - [Managing Sidebar](./first-pages/manage-sidebar/) Customize your site's navigation
  - [Use JavaScript](./first-pages/use-javascript/) Write inline scripts in markdown
  - [URLs](./first-pages/urls/) Customize your pages' permalinks
  - [Layouts](./first-pages/layouts/) Give your page a custom layout
- [Presets](./presets/getting-started/) Customize Rocket with config presets
  - [Overriding](./presets/overriding/) Override preset templates
  - [Using Templates](./presets/using-templates/) Make use of preset templates
  - [Create Your Own](./presets/create-your-own/getting-started/) Write and publish your own presets
- [Configuration](./configuration/getting-started/) Make Rocket your own
- [Go Live](./go-live/overview/) Publish your site
  - [Social Media](./go-live/social-media/) Generate social images
