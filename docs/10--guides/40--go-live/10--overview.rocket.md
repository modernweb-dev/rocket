```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/40--go-live/10--overview.rocket.md';
import { pageTree, setupUnifiedPlugins, footerMenu, layout } from '../../recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu, layout };
/* END - Rocket auto generated - do not touch */
```

# Overview

A few things are usually needed before going live "for real".

## Add a Not Found Page

When a user enters a URL that does not exist, a "famous" 404 Page Not Found error occurs.
Many servers are configured to handle this automatically and to serve a 404.html page instead.

The [Rocket Launch preset](../../docs/presets/launch.md) ships a default 404 template you can use.

To enable it, you need to create a `404.md` and use the 404 layout.

👉 `docs/404.md`

```markdown copy
---
layout: layout-404
permalink: 404.html
---
```

This results in a `404.html` page, which will do nothing by itself. But many hosting services like netlify or firebase, for example will redirect 404s to this `404.html` by default.

If the hosting provider doesn't already do this, then you may be able to accomplish it via some settings for example by using a `.htaccess` file in case of an apache server.

## Add a Sitemap

A sitemap can be used to inform search engines or services about the pages your site has.

You can create one by adding this file:

👉 `docs/sitemap.njk`

```markdown copy
---
layout: layout-raw
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---

<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {% raw %}{% for page in collections.all %}
    {%- if page.url !== '/404.html' -%}
    <url>
      <loc>{{ rocketConfig.absoluteBaseUrl }}{{ page.url | url }}</loc>
      <lastmod>{{ page.date.toISOString() }}</lastmod>
      <changefreq>{{ page.data.changeFreq if page.data.changeFreq else "monthly" }}</changefreq>
    </url>
    {%- endif -%}
  {% endfor %}{% endraw %}
</urlset>
```
