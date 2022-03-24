```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/50--go-live.rocket.md';
import {
  html,
  layout,
  setupUnifiedPlugins,
  components,
  openGraphLayout,
} from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
/* END - Rocket auto generated - do not touch */

import { inlineFile } from '@rocket/engine';
import { createRequire } from 'module';
import path from 'path';

const { resolve } = createRequire(new URL('.', import.meta.url));
```

# Go Live

A few things are usually needed before going live "for real".

## Add a Not Found Page

When a user enters a URL that does not exist, a "famous" 404 Page Not Found error occurs.
Many servers are configured to handle this automatically and to serve a `404.html` page instead.

Be sure to check your preset if it comes with a 404 Layout you can use.

As an example

The [Rocket Launch preset](../../20--presets/20--launch/10--overview.rocket.md) ships a default 404 template you can use.

To enable it, you need to create a `404.md` and use the 404 layout.

👉 `site/pages/404.html.rocket.js`

```js
import { Layout404 } from '@rocket/launch';

export const layout = new Layout404();

export default () => '';
```

This results in a `404.html` page, which will do nothing by itself. But many hosting services like netlify or firebase, for example will redirect 404s to this `404.html` by default.

If the hosting provider doesn't already do this, then you may be able to accomplish it via some settings for example by using a `.htaccess` file in case of an apache server.

## Add a Sitemap

A sitemap can be used to inform search engines or services about the pages your site has.

You can create one by adding this file:

👉 `site/pages/sitemap.xml.rocket.js`

```js
import { LayoutSitemap, PageTree } from '@rocket/engine';
import rocketConfig from '../config.rocket.js';

export const pageTree = new PageTree();
await pageTree.restore(new URL('./pageTreeData.rocketGenerated.json', import.meta.url));

export const layout = new LayoutSitemap({
  pageTree,
  absoluteBaseUrl: rocketConfig.absoluteBaseUrl,
});

export default () => '';
```

The code of the `LayoutSitemap` is rather short so you can copy and tweak it if needed.

```js server
const layoutSitemapCode = await inlineFile(
  path.join(resolve('@rocket/engine'), '..', 'layouts/LayoutSitemap.js'),
);
```

<pre><code>
${layoutSitemapCode.values}
</code></pre>
