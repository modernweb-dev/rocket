```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/index.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('content-area', await import('@rocket/components/content-area.js').then(m => m.ContentArea));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

import { pageTree } from '#src/layouts/layoutData.js';
import { ChildListMenu } from '@rocket/engine';
```

# Themes

Themes are packages that ship ready to go layouts and components.

In most cases in order to use one all we need to do is install it and then import it.

<div>${pageTree.renderMenu(new ChildListMenu(), sourceRelativeFilePath)}</div>
