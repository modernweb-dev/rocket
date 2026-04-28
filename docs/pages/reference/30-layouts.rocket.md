```js server
export const config = {
  path: '/reference/layouts',
  metadata: {
    title: 'Layouts',
    description: 'Render PageData into complete HTML documents with Rocket layouts and helpers.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Layout tip',
          description:
            'Keep layouts focused on PageData-to-document rendering; keep site-specific facts in data modules passed into the layout.',
        },
      },
    },
  },
  menu: { iconName: 'layout-text-sidebar-reverse', order: 30 },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Layouts

A layout turns `pageData` into a complete HTML document. Markdown Pages can export their own
`layout` function, or rely on Rocket's default layout.

## Page layout export

Rocket calls a Markdown Page's exported `layout` with one argument: `pageData`.

````markdown
```js server
import { html } from 'lit';
import { document } from '@rocket/js/layout-helper.js';

export const config = {
  path: '/',
  metadata: {
    title: 'Home',
    description: 'Welcome to the Acme Docs home page.',
  },
};

export const layout = pageData =>
  document(pageData, pageData.content, {
    menu: false,
    title: `${pageData.metadata.title} | Acme Docs`,
    headerContent: html`
      <meta name="description" content=${pageData.metadata.description} />
      <link rel="stylesheet" href="/styles/site.css" />
    `,
  });
```

# Home

Welcome to Acme Docs.
````

For reusable layouts, keep the layout implementation in a JavaScript module and bind site data from
the Page:

```js label="Page layout export"
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from './siteData.js';

export const layout = pageData => atlasDocLayout(pageData, siteData);
```

## PageData

`pageData` is owned by Rocket and created for each render. Layouts commonly use:

- `pageData.metadata`: normalized Page Metadata for the current Page.
- `pageData.title`: convenience alias for `pageData.metadata.title`.
- `pageData.content`: rendered Markdown or Page content.
- `pageData.url`: current request pathname.
- `pageData.pageRegistry`: map of discovered Pages.
- `pageData.pageTree`: menu tree built from the registry.
- `pageData.toc`: table-of-contents tree for the current Page.
- `pageData.clientCode`: generated browser module code for client scripts, demos, and hydrated
  components.

Do not construct `PageData` by hand in normal site code. Use the object passed by Rocket.

## Document helper

`document` builds the HTML shell used by simple layouts:

```js label="layout.js"
import { html } from 'lit';
import { document } from '@rocket/js/layout-helper.js';
import { resolve } from '@rocket/js/resolve.js';

export const layout = pageData =>
  document(pageData, pageData.content, {
    menu: 'html',
    title: `${pageData.metadata.title} | Acme Docs`,
    headerContent: html`
      <link rel="stylesheet" href="${resolve('./styles/docs.css', import.meta)}" />
    `,
  });
```

The options are:

- `menu`: set to `'html'` for Rocket's default HTML menu or `false` for no default menu.
- `title`: content for the document `<title>`.
- `headerContent`: extra content inserted into `<head>`, such as CSS, metadata, or module scripts.

`document` emits Document Baseline Metadata for every document it creates: UTF-8 charset metadata
and the standard responsive viewport metadata. This baseline is not Site Head Metadata and does not
depend on the `siteHeadMetadata` config option.

`document` also inserts `pageData.clientCode`, so layouts using it automatically include code from
`js client`, `js demo`, and Component Hydration.

For the full `pageData` shape, see [PageData](/reference/page-data).

## Default layout

If a Markdown Page does not export a layout, Rocket uses `@rocket/js/layout.js`.

You can also re-export it explicitly:

````markdown
```js server
export const config = {
  path: '/minimal',
};

export { layout } from '@rocket/js/layout.js';
```

# Minimal

This Page uses Rocket's default layout.
````

## Layout components

The atlas layouts export both a layout function and the Registered Components they require:

```js label="Atlas layout components"
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
```

When a Page uses one of these layouts, keep the matching `components` export. It lets Rocket render
layout-owned custom elements such as menus, table of contents, and Web Awesome callouts.

See [Atlas Layouts](/advanced/atlas-layouts) for the atlas layout data shape, wrapper pattern, and
component map details.
