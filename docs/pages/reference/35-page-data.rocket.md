```js server
export const config = {
  path: '/reference/page-data',
  metadata: {
    title: 'PageData',
    description: 'Read the normalized PageData object used by layouts and JavaScript Pages.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'PageData tip',
          description:
            'Read from pageData in layouts and JavaScript Pages instead of rebuilding navigation, metadata, or registry state yourself.',
        },
      },
    },
  },
  menu: {
    iconName: 'database',
    order: 35,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# PageData

`pageData` is the layout-facing object Rocket creates for each Page render. Layouts and JavaScript
Pages use it to read the current Page Metadata, rendered content, navigation tree, table of
contents, Page Registry Query, pagination state, and generated browser code.

Do not construct `PageData` by hand in normal site code. Use the object Rocket passes to the
layout or JavaScript Page.

## Where PageData appears

Markdown Pages pass `pageData` into their layout:

```js label="Markdown Page layout"
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from './siteData.js';

export const layout = pageData => atlasDocLayout(pageData, siteData);
```

JavaScript Pages receive the same object in the Page context:

```js label="src/pages/status.rocket.js"
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

export default async (_request, { pageData }) => {
  pageData.content = html`<h1>${pageData.metadata.title}</h1>`;
  return new Response(await ssrRender(atlasDocLayout(pageData, siteData)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};
```

## Fields

`pageData.metadata` is the current Page's normalized Page Metadata:

```ts
type PageMetadataCustomValue =
  | string
  | number
  | boolean
  | null
  | PageMetadataCustomValue[]
  | { [key: string]: PageMetadataCustomValue };

type PageMetadata = {
  title: string;
  linkText?: string;
  description?: string;
  date?: string;
  updated?: string;
  tags?: string[];
  authors?: string[];
  custom?: Record<string, PageMetadataCustomValue>;
};
```

`pageData.title` is a layout convenience backed by `pageData.metadata.title`.

`pageData.content` is the rendered Markdown content, or content assigned by a JavaScript Page.

`pageData.url` is the current request pathname.

`pageData.pageRegistry` is the map of all discovered Pages.

`pageData.pages` is the Page Registry Query. Use `pageData.pages.query(...)` to build Page
Collections from discovered Pages.

`pageData.pageTree` is the navigation tree built from visible Pages.

`pageData.pagination` is set when the current JavaScript Page exports `pagination`. It contains the
current Page Collection slice and archive navigation paths.

`pageData.toc` is the table-of-contents tree for the current Markdown Page. JavaScript Pages start
with an empty table of contents unless they assign one.

`pageData.clientCode` is generated browser module code for `js client`, `js demo`, client-loaded
Registered Components, and hydrated Registered Components.

`pageData.addIconReferences(iconReferences)` adds extra Icon References to the Page's Icon Manifest
for browser-created `rocket-icon` elements. Use Page config for static references; use this method
when a layout or JavaScript Page knows the references only during render:

```js label="layout.js"
export const layout = pageData => {
  pageData.addIconReferences([
    { library: 'bootstrap', name: 'plus-square' },
    { library: 'bootstrap', name: 'dash-square' },
  ]);

  return document(pageData, pageData.content);
};
```

Each reference must include `name`; omit `library` only when the active Page has a Default Icon
Library.

`pageData.siteHeadMetadata` is set when project config enables Site Head Metadata. It contains the
current Page's formatted title, description, canonical URL, site name, default description, and
language for Rocket-owned document helpers. It does not control Document Baseline Metadata such as
UTF-8 charset or responsive viewport tags.

Fields beginning with `_` are Rocket-owned internals.

## Current Page Metadata

Layouts and JavaScript Pages can read descriptive Page Metadata directly from the current
`pageData`:

```js label="layout.js"
import { html } from 'lit';
import { document } from '@rocket/js/layout-helper.js';

export const layout = pageData => {
  const { title, description, date, updated, tags, authors, custom } = pageData.metadata;

  return document(pageData, pageData.content, {
    title: `${title} | Acme Docs`,
    headerContent: html`
      <meta name="description" content=${description ?? ''} />
      <meta name="article:published_time" content=${date ?? ''} />
      <meta name="article:modified_time" content=${updated ?? ''} />
      <meta name="keywords" content=${tags?.join(',') ?? ''} />
      <meta name="author" content=${authors?.join(',') ?? ''} />
      <meta name="acme-section" content=${custom?.section ?? ''} />
    `,
  });
};
```

## Page registry

`pageData.pageRegistry` is a `Map` keyed by configured Page path. Its entries use the same
`PageMetadata` shape as `pageData.metadata`:

```ts
type PageRegistry = Map<
  string,
  {
    file: string;
    module: Module;
    metadata: PageMetadata;
    demoNames?: string[];
  }
>;
```

Use the registry when a custom layout or JavaScript Page needs the complete list of discovered
Pages. For most navigation work, prefer `pageData.pageTree`.

## Page Registry Query

`pageData.pages.query(...)` filters and sorts discovered Pages into Page Collections:

```ts
type PageRegistryQueryOptions = {
  tags?: string | string[];
  author?: string;
  authors?: string | string[];
  pathPrefix?: string;
  sortBy?: 'date';
  sortDirection?: 'asc' | 'desc';
};

type PageCollectionEntry = {
  path: string;
  url: string;
  metadata: PageMetadata;
  file: string;
  page: Page;
};
```

The query returns entries with normalized Page Metadata:

```js label="Page Registry Query"
const posts = pageData.pages.query({
  tags: 'blog',
  pathPrefix: '/posts/',
  sortBy: 'date',
  sortDirection: 'desc',
});
```

`tags` and `authors` match only when every requested value is present. `author` is a convenience
for one author value. `pathPrefix` matches configured Page paths, and date sorting uses
`metadata.date`; Pages without dates sort after dated Pages.

## Page Collection pagination

Static JavaScript Pages can export `pagination` to generate a paginated archive from a Page
Collection:

```js label="pagination export"
export const pagination = pageData => ({
  pageSize: 10,
  collection: pageData.pages.query({
    tags: 'blog',
    pathPrefix: '/posts/',
    sortBy: 'date',
    sortDirection: 'desc',
  }),
});
```

When Rocket renders the archive, `pageData.pagination` contains:

```ts
type PagePagination = {
  items: PageCollectionEntry[];
  currentPage: number;
  totalPages: number;
  basePath: string;
  nextPath?: string;
  previousPath?: string;
};
```

Page 1 renders at the owning Page path. Later pages render at numbered child paths such as
`/blog/2/` and `/blog/3/`. Rocket does not generate a `/blog/1/` path.

## Page tree

`pageData.pageTree` is the menu-ready tree derived from visible Pages:

```ts
type PageTree = {
  name: string;
  url: string;
  file: string;
  module: Module;
  linkText: string;
  menuNoLink?: true;
  children: PageTree[];
};
```

Pages with `menu: false` are omitted from the tree, except the root Page, which remains as the tree
root. Pages with `menu.noLink` stay in the tree but are not destinations for menu links or
previous/next navigation.

`menu.parent` can place a Page under a different menu path without changing its public URL.

## Table of contents

`pageData.toc` is a heading tree:

```ts
type HeadlineTree = {
  id: string;
  text: string;
  level: number;
  children: HeadlineTree[];
};
```

Markdown Pages fill this from headings. `link-text` changes a heading's displayed text, and
`menu-exclude` leaves a heading out of the tree.

## Client code

Layouts should include `pageData.clientCode` in the document `<head>` or use Rocket's `document`
helper, which inserts it automatically:

```js label="layout.js"
import { document } from '@rocket/js/layout-helper.js';

export const layout = pageData =>
  document(pageData, pageData.content, {
    menu: 'html',
  });
```

Without `pageData.clientCode`, Page-local browser code, demos, and hydration scripts will not run.

## Custom navigation example

For small custom layouts, render links from `pageData.pageTree.children`:

```js label="custom-navigation-layout.js"
import { html } from 'lit';
import { document } from '@rocket/js/layout-helper.js';

function topLevelLinks(pageTree) {
  return html`
    <nav>
      ${pageTree.children.map(
        page => html`<a href=${page.menuNoLink ? undefined : page.url}>${page.linkText}</a>`,
      )}
    </nav>
  `;
}

export const layout = pageData =>
  document(pageData, html`${topLevelLinks(pageData.pageTree)} ${pageData.content}`, {
    menu: false,
  });
```

For richer navigation, use the menu components provided by the atlas layout.

## Related docs

- [Layouts](/reference/layouts) shows how layouts consume `pageData`.
- [Page Collections](/page-collections) shows a blog archive built from `pageData.pages` and
  `pageData.pagination`.
- [Menus](/advanced/menus) documents menu config and heading rules.
- [JavaScript Pages With Layouts](/examples/js-pages-with-layout) shows the recommended JavaScript
  Page pattern.
