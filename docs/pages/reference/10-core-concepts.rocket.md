```js server
export const config = {
  path: '/reference/core-concepts',
  metadata: {
    title: 'Core Concepts',
    description:
      'Understand Rocket Pages, layouts, PageData, components, assets, and deployment adapters.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Concept tip',
          description:
            'Keep the Page, PageData, layout, and component boundaries separate; most Rocket behavior follows from those contracts.',
        },
      },
    },
  },
  menu: {
    iconName: 'diagram-3',
    order: 10,
  },
};
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Core Concepts

Rocket is a static-site framework for configured **Pages**. A Page can be durable Markdown content
or a JavaScript module that returns a web response. Rocket discovers those Pages from your config,
renders them through layouts, and builds static output plus any adapter output the site needs.

<wa-callout>
  <rocket-icon slot="icon" name="rocket"></rocket-icon>
  Rocket is content-first and JavaScript-optional. Start with HTML generated from Pages, then add
  browser code or Web Components where the visitor experience requires it.
</wa-callout>

## Page

A **Page** is a configured content entry. Every Page exports a `config` object with a `path`:

````markdown
```js server
export const config = {
  path: '/about',
  metadata: { title: 'About' },
};

export { layout } from '@rocket/js/layout.js';
```

# About

This Markdown Page renders at `/about`.
````

`config.path` is the public route path. The source file can live wherever your `includeGlobs` find
it, so file structure and URL structure do not have to match.

## Markdown Pages

Markdown Pages use `.rocket.md`. They are the default choice for documentation, tutorials, product
pages, and other content that can render ahead of time.

Markdown Pages can contain special JavaScript fences:

- `js server` runs while Rocket loads and renders the Page. Use it for `config`, `layout`,
  `components`, imports, and values interpolated into Markdown.
- `js client` is emitted as browser module code for that Page.
- `js demo` creates a JavaScript Demo and a Standalone Demo URL.

Template expressions in Markdown are evaluated from the Page's server scope. Expressions inside
fenced code examples are displayed as code.

## JavaScript Pages

JavaScript Pages use `.rocket.js`. Use them when JavaScript should produce the response, for
example generated HTML, JSON endpoints, parameterized pages, generated images, or adapter-specific
behavior.

```js label="Server-rendered JavaScript Page"
/** @type {import('@rocket/js/types.js').JsPage} */
export default async (request, { params }) => {
  return Response.json({
    path: new URL(request.url).pathname,
    params,
  });
};

export const config = {
  path: '/api/:name',
  render: 'server',
  menu: false,
};
```

A JavaScript Page can return a `Response`, string, object, `null`, or `undefined`. Rocket normalizes
that value to a web `Response`.

Concrete JavaScript Pages default to static rendering. During `rocket build`, Rocket creates one
build-time `Request` for the concrete `config.path` and writes the response as static output.
Request-time JavaScript Pages and parameterized JavaScript Pages use `render: 'server'` and need a
production adapter.

## Page Runtime

The **Page Runtime** matches a request path to one Page, asks a **Page Module Loader** for the
environment-specific module, creates **PageData**, and returns a `Response`.

This same model is used in development, static builds, and deployment adapters. Static build
synthesizes requests for static route paths; adapters receive real platform requests for
server-rendered Pages.

## PageData

`pageData` is created by Rocket for each render and passed to layouts. It includes:

- `metadata`: the current Page's normalized Page Metadata.
- `pageRegistry`: all discovered Pages.
- `pageTree`: the menu tree built from visible Pages.
- `title`: a convenience alias for `metadata.title`.
- `content`: the rendered Page body.
- `toc`: the heading tree for the current Page.
- `url`: the current request pathname.
- `clientCode`: generated browser module code for client scripts, demos, and hydration.

Site data such as logos, header links, or footer links is separate. A Page usually imports that data
and passes it to a reusable layout.

## Layout

A Markdown Page may export a `layout` function. Rocket calls it with `pageData`; the layout returns
the full HTML document.

```js label="layout export"
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from './siteData.js';

export const layout = pageData => atlasDocLayout(pageData, siteData);
```

If a Markdown Page does not export `layout`, Rocket uses the default `@rocket/js/layout.js` layout.

## Registered Components

A **Registered Component** is a Page-owned entry in the explicit `components` export. It maps a
custom element tag name to a module file, exported class name, and Loading Strategy.

```js label="components export"
const cardFile = new URL('./components/AcmeCard.js', import.meta.url).href;

export const components = {
  'acme-card': {
    file: cardFile,
    className: 'AcmeCard',
    loading: 'server',
  },
};
```

The **Loading Strategy** controls whether Rocket server-renders the component, loads it only in the
browser, or server-renders it and later hydrates it.

## Page-local Custom Elements

A **Page-local Custom Element** is a custom element tag declared directly in a Markdown Page's
`js client` block:

````markdown
```js client
class InlineCounter extends HTMLElement {}
customElements.define('inline-counter', InlineCounter);
```

<inline-counter></inline-counter>
````

Page-local Custom Elements are not Registered Components. They do not use a Loading Strategy and are
not managed by Component Hydration.

## Menus

Rocket builds menus from the discovered Pages. Visible Pages are placed according to their
`config.path`, or under `config.menu.parent` when a Page should appear under a different menu
section.

`config.menu` controls whether a Page appears in navigation, what label it uses, and how siblings
are ordered. The same Page tree powers layout menus and previous/next links.

## Builds And Adapters

Markdown Pages and concrete JavaScript Pages build to static output by default. Pages with
`config.render: 'server'` need a production adapter. Parameterized JavaScript Pages also need
`render: 'server'` until Rocket has an API for enumerating static params.

The static build writes files to `dist/`. Adapters, such as the Netlify adapter, may also write
platform-specific output for request-time routes.
