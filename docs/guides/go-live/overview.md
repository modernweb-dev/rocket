# Go Live >> Overview ||10

A few things are usually needed before going live "for real".

## Add a not found page

When a user enters a url that does not exists then a "famous" 404 page not found error occures.
Many servers are configured to handle this automatically and to serve a 404.html page instead.

The [Rocket Lauch Preset](../../docs/presets/launch.md) ships a default 404 template you can use.

To enable it you need to creating a 404.md and use the 404 layout.

👉 `docs/404.md`

```
---
layout: 404.njk
permalink: 404.html
---
```

## Add a sitemap

A sitemap can be used to inform search engines or services about the pages your site has.

You can create one by adding this file

👉 `docs/sitemap.njk`

{% raw %}

```
---
layout: pure-content.njk
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {% for page in collections.all %}
    <url>
      <loc>{{ rocketConfig.absoluteBaseUrl }}{{ page.url | url }}</loc>
      <lastmod>{{ page.date.toISOString() }}</lastmod>
      <changefreq>{{ page.data.changeFreq if page.data.changeFreq else "monthly" }}</changefreq>
    </url>
  {% endfor %}
</urlset>
```

{% endraw %}
