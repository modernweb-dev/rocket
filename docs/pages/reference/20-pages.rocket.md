```js server
export const config = {
  path: '/reference/pages',
  metadata: {
    title: 'Pages',
    description:
      'Define Rocket Markdown and JavaScript Pages with paths, metadata, rendering, and discovery rules.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Page tip',
          description:
            'Every Page needs a unique path and metadata title; add menu config only when it should appear in navigation.',
        },
      },
    },
  },
  menu: { iconName: 'file-earmark-text', order: 20 },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Pages

Pages are the units Rocket discovers, renders, and deploys. A Page is either a Markdown file
ending in `.rocket.md` or a JavaScript file ending in `.rocket.js`.

## Discovery

Rocket discovers Pages from `includeGlobs` in `rocket-config.js`:

```js label="rocket-config.js"
/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/**/*.rocket.{md,js}', 'src/pages/**/*.rocket.{md,js}'],
};
```

Each matching file is loaded so Rocket can read its exported `config`. Every discovered Page must
have a unique `config.path`.

`excludeRegex` removes files from discovery. Values are matched against file paths with string
inclusion or regular expressions; `node_modules` is always excluded.

```js label="rocket-config.js"
export default {
  includeGlobs: ['src/**/*.rocket.{md,js}'],
  excludeRegex: [/\.draft\.rocket\.md$/],
};
```

For the full project config shape, see [Configuration](/reference/configuration).

## Route paths

Rocket uses explicit route paths, not file-based routing:

```js label="src/components/Button.docs.rocket.md"
export const config = {
  path: '/components/button',
};
```

The file can live near the component it documents while the public URL stays controlled by
`config.path`.

Route paths can contain parameters for request-time Pages:

```js label="Parameterized Page config"
export const config = {
  path: '/playground/:componentName',
  render: 'server',
  menu: false,
};
```

The Page Runtime passes those parameters to JavaScript Pages as `context.params`. Static JavaScript
Pages must use concrete paths because `rocket build` renders one output document for each static
Page path.

## Page config

```ts
type PageMetadataCustomValue =
  | string
  | number
  | boolean
  | null
  | PageMetadataCustomValue[]
  | { [key: string]: PageMetadataCustomValue };

type PageConfig = {
  path: string;
  metadata?: {
    title?: string;
    description?: string;
    date?: string;
    updated?: string;
    tags?: string[];
    authors?: string[];
    custom?: Record<string, PageMetadataCustomValue>;
  };
  render?: 'static' | 'server';
  discoverability?: {
    sitemap?: boolean;
    robots?: 'allow' | 'disallow';
  };
  iconReferences?: {
    library?: string;
    name: string;
  }[];
  siteHeadMetadata?: {
    indexing?: 'index' | 'noindex';
    socialPreview?: {
      image?: string;
    };
  };
  menu?:
    | false
    | {
        order?: number;
        linkText?: string;
        parent?: string;
        noLink?: true;
      };
};
```

JavaScript Page modules can also export Page-level runtime hooks:

```ts
type PagePaginationConfig = {
  pageSize: number;
  collection: PageCollectionEntry[];
};

type PagePaginationDeclaration =
  | PagePaginationConfig
  | ((pageData: PageData) => PagePaginationConfig);

type JavaScriptPageModule = {
  pagination?: PagePaginationDeclaration;
};
```

`path` is required and should start with `/`.

`metadata` holds Page Metadata. Rocket validates `config.metadata` during Page discovery and fails
discovery for invalid known fields or unknown root fields. Project-specific fields belong under
`metadata.custom`, not at the root of `metadata`.

`metadata.title` sets the document title. Markdown Pages can also derive a title from their first
`h1`.

`metadata.description` is a string description for the Page.

`metadata.date` and `metadata.updated` must be date-only ISO strings in `YYYY-MM-DD` format.

`metadata.tags` and `metadata.authors` must be string arrays. Rocket normalizes both fields by
trimming entries and removing duplicates in first-seen order.

`metadata.custom` accepts structured project data: objects made from strings, numbers, booleans,
`null`, arrays, and nested objects. Rocket preserves `metadata.custom` on normalized
`page.metadata.custom` and does not assign meaning to its keys, including keys that share names
with known Page Metadata fields.

`render` defaults to `static`. Use the default for Markdown Pages and JavaScript Pages that can be
rendered once from a concrete `path`. Use `render: 'server'` when the Page must run at request time
or when a JavaScript Page path contains route parameters.

`discoverability.sitemap: false` opts the Page out of `sitemap.xml` when the project enables the
Sitemap. The Page still renders, and its navigation behavior still comes from `menu`.

`discoverability.robots: 'disallow'` adds a Page-specific `Disallow` directive to `robots.txt` when
the project enables the Robots File. `discoverability.robots: 'allow'`, or omitting
`discoverability.robots`, emits no Page-specific `Disallow` directive. Robots Page Options are
crawler directives only; they do not change Sitemap inclusion, rendering, navigation, or HTML
`noindex` metadata.

`iconReferences` adds extra Icon References to the Page's Icon Manifest for browser-created
`rocket-icon` elements. Use it when a Page's client code, `js demo`, or client-loaded component can
create icons that are not present in the server-rendered HTML:

```js label="Page config"
export const config = {
  path: '/examples/component-showcase',
  iconReferences: [
    { library: 'bootstrap', name: 'plus-square' },
    { library: 'bootstrap', name: 'dash-square' },
  ],
};
```

Omit `library` only when the active layout or project configuration supplies a Default Icon Library.
Each reference must still resolve through a configured trusted Icon Library.

`siteHeadMetadata.indexing` controls Page-specific HTML robots indexing metadata when project config
enables Site Head Metadata. `siteHeadMetadata.indexing: 'noindex'` emits
`<meta name="robots" content="noindex">` in the rendered Page. `siteHeadMetadata.indexing: 'index'`,
or omitting `siteHeadMetadata.indexing`, emits no HTML robots tag because indexing is the default.

HTML indexing metadata is separate from Robots File directives. Use `siteHeadMetadata.indexing` for
rendered Page HTML and `discoverability.robots` for generated `robots.txt` crawler directives.

`siteHeadMetadata.socialPreview.image` selects an Explicit Social Preview Image for the Page when
project config enables Site Head Metadata. It accepts:

- a Page-relative asset path such as `social/card.png`
- a site-root asset path such as `/social/card.png`
- an absolute public `http:` or `https:` URL such as `https://cdn.example.com/card.png`

Page-relative assets resolve from the Page's public document path. For example, on a Page at
`/guides/runtime`, `social/card.png` emits
`https://docs.example.com/guides/runtime/social/card.png` when `siteOrigin` is
`https://docs.example.com`. Site-root assets resolve from `siteOrigin`, so `/social/card.png` emits
`https://docs.example.com/social/card.png`.

Site Head Metadata already requires `siteOrigin` because rendered metadata needs public absolute
URLs. Rocket validates invalid image values as Page-level Site Head Metadata errors during Page
discovery.

When project config also enables `siteHeadMetadata.socialPreview`, Pages without
`siteHeadMetadata.socialPreview.image` receive generated Default Social Preview Images during static
builds. A Page-level `socialPreview.image` always takes precedence over that generated default for
the current Page.

`menu: false` hides the Page from the menu tree. Use it for API routes, parameterized Pages, and
other entries that should not appear in navigation.

`menu.parent` changes where a Page appears in the menu tree without changing its public URL.

`menu.noLink` keeps the Page visible as a menu group but prevents menu links and previous/next links
from treating it as a destination.

## Markdown Pages

Markdown Pages put setup code in a `js server` fence and content below it:

````markdown
```js server
export const config = {
  path: '/docs/button',
  metadata: { title: 'Button' },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

export const layout = pageData => atlasDocLayout(pageData, siteData);
```

# Button

The Button Page is written in Markdown.
````

Markdown Pages support:

- Markdown and raw HTML.
- `js server` setup code.
- `js client` browser module code.
- `js demo` JavaScript Demos and Standalone Demo URLs.
- Registered Components through an explicit `components` export.

Markdown Pages build to static HTML unless `config.render` is set to `server`.

For the full Markdown authoring surface, see
[Markdown Authoring](/reference/markdown-authoring).

## JavaScript Pages

JavaScript Pages export a function as `default` or `content`. The function receives a web
`Request` and a context object:

```js label="src/pages/status.rocket.js"
/** @type {import('@rocket/js/types.js').JsPage} */
export default async (request, { pageData }) => {
  const pathname = new URL(request.url).pathname;

  return `
    <h1>${pageData.metadata.title}</h1>
    <p>${pageData.metadata.description}</p>
    <p>Rendered once for <code>${pathname}</code>.</p>
  `;
};

export const config = {
  path: '/status',
  metadata: {
    title: 'Status',
    description: 'Current service status.',
  },
};
```

This concrete JavaScript Page uses the default static render mode and builds to
`dist/status/index.html`.

Use `render: 'server'` for request-time and parameterized JavaScript Pages:

```js label="src/pages/playground.rocket.js"
/** @type {import('@rocket/js/types.js').JsPage} */
export default async (request, { params, adapterContext }) => {
  return Response.json({
    path: new URL(request.url).pathname,
    componentName: params.componentName,
    platform: adapterContext?.platform,
  });
};

export const config = {
  path: '/playground/:componentName',
  render: 'server',
  menu: false,
};
```

`context.params` contains route parameters from `config.path`.

`context.pageData` is a Rocket-created `PageData` instance for the current request. Use
`context.pageData.metadata` to read the current Page's normalized Page Metadata. `pageData.title`
remains available as a convenience alias for `pageData.metadata.title`.

`context.adapterContext` contains platform-specific data passed by a deployment adapter. Rocket does
not interpret those fields.

JavaScript Pages can return:

- `Response`
- `string`, normalized as HTML
- plain object, normalized with `Response.json`
- `null` or `undefined`, normalized as an empty response

Concrete JavaScript Pages can be emitted during the static build. Parameterized JavaScript Pages
and JavaScript Pages that depend on request-time data need `render: 'server'` and a configured
adapter for production builds.

For static non-HTML output, use a file extension in `config.path`. A Page at
`/api/docs-index.json` builds to `dist/api/docs-index.json`. Extensionless paths are treated as
document paths and build to `index.html`.

## Paginated archive Pages

A static JavaScript Page can export `pagination` to generate a Page Collection archive. The
collection usually comes from the Page Registry Query exposed as `pageData.pages`:

```js label="src/pages/blog.rocket.js"
export const config = {
  path: '/blog',
  metadata: { title: 'Blog' },
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
```

During rendering, the JavaScript Page reads the current archive slice from
`context.pageData.pagination`. Page 1 renders at the owning Page path. Later pages render at
numbered child paths such as `/blog/2/`. Rocket does not create `/blog/1/`.

Generated archive Pages are variants of the owning JavaScript Page. They are included in Sitemap
and Robots File output when Site Discoverability is enabled, but they are not separate configured
Pages in the Page Registry or menu tree.

When Site Head Metadata and static Social Preview Images are enabled, each generated archive Page
uses its concrete URL for canonical and social metadata and receives its own Default Social Preview
Image. Standalone Demo URLs stay excluded from Default Social Preview Images by default because they
are focused demo documents rather than separate Page identities.

## Title and link text

For Markdown Pages, Rocket resolves title and link text from:

| Value     | Resolution order                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------- |
| Link text | `config.menu.linkText`, then the `link-text` attribute on the first `h1`                          |
| Title     | `config.metadata.title`, then first `h1` text, then link text, then a fallback from `config.path` |

For JavaScript Pages, link text can only come from `config.menu.linkText`. Title resolution is
`config.metadata.title`, then link text, then a fallback from `config.path`.

## Heading rules

Markdown Pages may have only one `h1`. The table of contents is built from the remaining headings.
Do not jump heading levels, for example from `h2` directly to `h4`.

Use `link-text` on a heading to change its menu or table-of-contents label:

```html
<h2 link-text="API">Application Programming Interface</h2>
```

Use `menu-exclude` to leave a heading out of the table of contents:

```html
<h2 menu-exclude>Internal setup note</h2>
```

## Custom element ownership

When a Markdown Page contains an authored custom element tag with a hyphen, Rocket validates that
the Page owns that tag in one of two ways:

- Register it in the Page's explicit `components` export.
- Define it as a Page-local Custom Element in the same Page's `js client` code.

The same tag cannot be both a Registered Component and a Page-local Custom Element.

## Build behavior

During `rocket build`, Rocket renders static Markdown Pages and concrete static JavaScript Pages
into `dist/`. Static Markdown Pages also emit Standalone Demo documents for every `js demo` export.

Pages with `render: 'server'` are skipped by the static renderer and passed to the configured
adapter. A build with server-rendered Pages and no adapter fails early.

## Common fixes

- Page missing: check `includeGlobs`, file extension, `config.path`, and duplicate path errors.
- Page not in navigation: check `menu: false`, `menu.parent`, and `menu.noLink`.
- Parameterized Page in navigation: set `menu: false`.
- Parameterized static JavaScript Page: set `render: 'server'` and configure an adapter.
