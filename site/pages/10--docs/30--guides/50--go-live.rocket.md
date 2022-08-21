```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/30--guides/50--go-live.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('rocket-main-docs', await import('@rocket/components/main-docs.js').then(m => m.RocketMainDocs));
  // prettier-ignore
  customElements.define('rocket-content-area', await import('@rocket/components/content-area.js').then(m => m.RocketContentArea));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

import { inlineFile } from '@rocket/engine';
import { createRequire } from 'module';
import path from 'path';

const { resolve } = createRequire(new URL('.', import.meta.url));
```

# Go Live

A few things are usually needed before going live "for real".

## Make sure all links are correct

When you launch a website you don't want the first feedback to be "that link doesn't work".

To prevent this we want to execute `rocket lint` before going live.
It will make sure all internal links are correct by using [check-html-links](../../30--tools/40--check-html-links/10--overview.rocket.md).
Typically we deploy via a Continuous Integration system like GitHub Actions or Netlify Deploy.
We can also integrate the lint command into that process.

```
rocket build
rocket lint
```

### Fixing broken links

If found a couple of broken links on your page and you want to fix them and verify that they are now correct it might be a little time consuming to create a full production build every time.
The reason is that a production build is doing a lot of things

1. Generate HTML
2. Generate & Inject Open Graph Images
3. Optimize Images (not available yet)
4. Optimize JavaScript

But there is a way around this. We can use an optional flag `--build-html` which means it will run only (1) and then lint that (non-optimized) HTML output.

So for a more time efficient way of validating link use

```bash
rocket lint --build-html
```

Note: We can do this as 2-4 generally does not impact links/references (as long as the optimizations scripts do not have related bugs)

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
