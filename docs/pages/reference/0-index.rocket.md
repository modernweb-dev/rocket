```js server
export const config = {
  path: '/reference',
  metadata: {
    title: 'Reference',
    description:
      'Look up Rocket concepts, configuration, Pages, layouts, components, assets, and CLI behavior.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Reference tip',
          description:
            'Use Reference when you know the concept name; use Guides when you want a workflow from start to finish.',
        },
      },
    },
  },
  menu: {
    linkText: 'Reference',
    iconName: 'book',
    noLink: true,
    order: 40,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Reference

Use Reference when you need the exact behavior behind a Rocket concept, option, or API. If you are
building your first site, start with [Start With AI](/setup/build-with-ai) and return here when you
need to look something up.

## Pages in this section

- [Core Concepts](/reference/core-concepts) explains the main objects Rocket works with.
- [Configuration](/reference/configuration) documents `rocket-config.js`, Page discovery, dev server
  adjustment, and adapters.
- [Pages](/reference/pages) documents Page discovery, `config`, route paths, render modes, and Page
  module shapes.
- [Markdown Authoring](/reference/markdown-authoring) covers `js server`, `js client`, `js demo`,
  interpolation, headings, and custom element ownership.
- [Code Blocks](/reference/code-blocks) covers `label="..."`, framed code examples, and copy behavior.
- [Layouts](/reference/layouts) explains `pageData`, the default layout, and the document helper.
- [PageData](/reference/page-data) documents the layout-facing data object, Page Registry Query, Page
  Collections, pagination, Page tree, table of contents, and generated browser code.
- [Components](/reference/components) documents Registered Components, Page-local Custom Elements, and
  loading strategies.
- [Rocket Icon](/reference/rocket-icon) documents the built-in `rocket-icon` component, Icon
  Libraries, loading behavior, and generated SVG assets.
- [Demos](/reference/demos) explains JavaScript Demos, `js demo` blocks, and Standalone Demo URLs.
- [Assets](/reference/assets) shows how to reference project files and package assets.
- [CLI](/reference/cli) lists available commands and options.

## Related guides

- [Component Loading](/component-loading) gives a decision guide for `server`, `client`, and
  `hydrate:*`.
- [Request-time JavaScript Pages](/request-time-javascript-pages) shows request-time Pages,
  JSON responses, and generated SVG responses.
- [Page Collections](/page-collections) builds a blog-scale archive from static Pages, Page
  Metadata, and generated pagination.
- [Deploy](/deploy) explains static deploys and adapter output.
- [Netlify Adapter](/netlify-adapter) documents the built-in production adapter.
