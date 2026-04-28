```js server
export const config = {
  path: '/page-collections',
  metadata: {
    title: 'Blog-scale Page Collections',
    description: 'Use Page Collections for dated archives, pagination, and blog-scale content.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Collection tip',
          description:
            'Use Page Collections for index views over real Pages, not as a replacement for ordinary hand-authored content.',
        },
      },
    },
  },
  menu: {
    linkText: 'Page Collections',
    iconName: 'collection',
    parent: '/guides',
    order: 25,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Blog-scale Page Collections

Most Rocket sites are made from ordinary static Pages. A hand-written home Page, an About Page, a
component reference Page, or a few standalone guides do not need a Page Collection. Create those as
normal Markdown or JavaScript Pages and let Rocket render one output document for each `config.path`.

Use a Page Collection when one Page needs to render a repeatable view of other Pages. Blog indexes,
dated archives, release-note lists, author pages, and tag pages all follow this model: the content
items stay as static Pages, while an archive Page queries the Page Registry and renders the matching
entries.

## Mark blog post Pages

Blog posts can stay as normal static Markdown Pages. Put the Page config in the Page's
`js server` block, and add Page Metadata that the archive can query:

```js label="src/pages/posts/first-launch.rocket.md"
export const config = {
  path: '/posts/first-launch',
  metadata: {
    title: 'First Launch',
    description: 'What changed in the first public launch.',
    date: '2026-05-25',
    tags: ['blog', 'launch'],
    authors: ['Ada Lovelace'],
  },
  menu: false,
};
```

```js label="src/pages/posts/component-notes.rocket.md"
export const config = {
  path: '/posts/component-notes',
  metadata: {
    title: 'Component Notes',
    description: 'Patterns from the first component documentation pass.',
    date: '2026-05-18',
    tags: ['blog', 'components'],
    authors: ['Grace Hopper'],
  },
  menu: false,
};
```

`metadata.date` must be a `YYYY-MM-DD` date string. Use `metadata.tags` for collection membership,
and use `metadata.authors` when the site needs author archives or byline filtering. `menu: false`
keeps posts out of the main navigation without hiding them from direct links, the Page Registry, or
the Sitemap.

## Query the Page Registry

Rocket exposes the Page Registry Query as `pageData.pages`. It returns Page Collection entries with
the Page path, URL, normalized metadata, source file, and original Page record:

```js label="Page Registry Query"
const posts = pageData.pages.query({
  tags: 'blog',
  pathPrefix: '/posts/',
  sortBy: 'date',
  sortDirection: 'desc',
});
```

This query finds Pages under `/posts/` that include the `blog` tag and sorts dated entries newest
first. Undated entries remain in the collection after dated entries. Use `tags: ['blog', 'launch']`
when every tag must be present, and add `author` or `authors` when an archive needs byline filters.

## Add the archive Page

Create one static JavaScript Page to own the archive path:

```js label="src/pages/blog.rocket.js"
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { atlasDocLayout, atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

export { components };

export const config = {
  path: '/blog',
  metadata: {
    title: 'Blog',
    description: 'Latest posts from the project.',
  },
};

export const pagination = pageData => ({
  pageSize: 10,
  collection: pageData.pages.query({
    tags: 'blog',
    pathPrefix: '/posts/',
    sortBy: 'date',
    sortDirection: 'desc',
  }),
});

export default async (_request, { pageData }) => {
  const pagination = pageData.pagination;

  pageData.content = html`
    <h1>Blog</h1>
    <ol>
      ${pagination.items.map(
        post => html`
          <li>
            <a href=${post.url}>${post.metadata.title}</a>
            <time datetime=${post.metadata.date ?? ''}>${post.metadata.date ?? 'Undated'}</time>
          </li>
        `,
      )}
    </ol>

    <nav aria-label="Blog pages">
      ${pagination.previousPath ? html`<a href=${pagination.previousPath}>Previous</a>` : ''}
      <span>Page ${pagination.currentPage} of ${pagination.totalPages}</span>
      ${pagination.nextPath ? html`<a href=${pagination.nextPath}>Next</a>` : ''}
    </nav>
  `;

  return new Response(await ssrRender(atlasDocLayout(pageData, siteData)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};
```

The `pagination` export turns the collection into generated archive Pages. `pageData.pagination`
contains the current slice of entries, the current page number, the total page count, and previous
or next archive paths for links.

## Archive paths

The owning Page path is page 1. With `config.path: '/blog'`, Rocket renders the first archive page
at `/blog` during runtime and `dist/blog/index.html` during a static build. Pagination links and
generated discoverability output use the canonical document path `/blog/` for that first page.

Later archive pages are numbered child paths:

```txt
/blog/
/blog/2/
/blog/3/
```

Rocket does not generate `/blog/1/`. The numbered archive Pages are generated variants of the
owning JavaScript Page, so they do not become separate entries in `pageData.pageRegistry` or the
menu tree.

## Sitemap and Robots File behavior

Generated archive Pages participate in Site Discoverability when the project enables those outputs
in `rocket-config.js`:

```js label="rocket-config.js"
export default {
  includeGlobs: ['src/pages/**/*.rocket.{md,js}'],
  siteOrigin: 'https://docs.example.com',
  siteDiscoverability: {
    sitemap: true,
    robots: true,
  },
};
```

When the Sitemap is enabled, Rocket includes the archive page 1 path and every generated numbered
archive path unless the owning archive Page sets `discoverability.sitemap: false`.

When the Robots File is enabled, `discoverability.robots: 'disallow'` on the owning archive Page
emits `Disallow` directives for page 1 and every generated numbered archive path. The post Pages
keep their own discoverability settings; hiding or disallowing the archive does not automatically
hide or disallow the posts.

## Checkpoint

Run a build and inspect the generated archive paths:

```bash
npm run build
ls dist/blog dist/blog/2
```

Use [PageData](/reference/page-data) for the Page Registry Query and pagination reference, and
[Configuration](/reference/configuration) for Sitemap and Robots File settings.
