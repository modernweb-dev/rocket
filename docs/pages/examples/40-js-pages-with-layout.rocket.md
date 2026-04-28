```js server
export const config = {
  path: '/examples/js-pages-with-layout',
  metadata: {
    title: 'JavaScript Pages With Layouts',
    description:
      'Use pageData to render JavaScript Pages through the same layout as Markdown Pages.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Layout reuse tip',
          description:
            'Set pageData.content inside the JavaScript Page, then pass the same pageData object through the layout.',
        },
      },
    },
  },
  menu: {
    linkText: 'JS Pages With Layouts',
    iconName: 'filetype-js',
    order: 40,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# JavaScript Pages With Layouts

JavaScript Pages can return any web `Response`, but they can also reuse the same layout as Markdown
Pages. The recommended pattern is to use the `pageData` object Rocket passes in the JavaScript Page
context.

Do not construct `PageData` manually. The Page Runtime already creates it with the current title,
URL, Page registry, menu tree, and any component hydration script.

## Basic HTML Page

```js label="src/pages/status.rocket.js"
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { atlasDocLayout, atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

export { components };

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (request, { pageData }) => {
  const url = new URL(request.url);

  pageData.content = html`
    <h1>Status</h1>
    <p>This response was rendered for <code>${url.pathname}</code>.</p>
  `;

  return new Response(await ssrRender(atlasDocLayout(pageData, siteData)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};

export const config = {
  path: '/status',
  metadata: { title: 'Status' },
};
```

This keeps the Page inside the same header, navigation, table of contents, and footer as the rest of
the site. Because `/status` is a concrete path and the content can be produced once, this Page uses
the default static render mode and builds to `dist/status/index.html`.

## Working Example

The [Server Time Page](/examples/time) is a live JavaScript Page using the same pattern:

```js label="docs/pages/examples/30-time.rocket.js"
export default async (request, { pageData }) => {
  const now = new Date();

  pageData.content = html`
    <h1>Server Time Page</h1>
    <p>${now.toISOString()}</p>
  `;

  return new Response(await ssrRender(atlasDocLayout(pageData, globalData)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = {
  path: '/examples/time',
  render: 'server',
};
```

## Parameterized Page

Route parameters from `config.path` are available as `context.params`:

```js label="src/pages/components-playground.rocket.js"
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { atlasDocLayout, atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from '../siteData.js';

export { components };

const componentsBySlug = new Map([
  ['button', { name: 'Button', status: 'stable' }],
  ['callout', { name: 'Callout', status: 'preview' }],
]);

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (_request, { params, pageData }) => {
  const component = componentsBySlug.get(params.componentName || '');

  if (!component) {
    return new Response('Component not found', { status: 404 });
  }

  pageData.content = html`
    <h1>${component.name}</h1>
    <p>Status: ${component.status}</p>
  `;

  return new Response(await ssrRender(atlasDocLayout(pageData, siteData)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};

export const config = {
  path: '/playground/:componentName',
  metadata: { title: 'Component playground' },
  render: 'server',
  menu: false,
};
```

Use `menu: false` for parameterized Pages unless the configured path is also a useful link target.

## HTML Versus JSON

Use the layout pattern only when the response is an HTML document. For JSON, return JSON directly:

```js label="src/pages/api/status.rocket.js"
export default async () => {
  return Response.json({
    status: 'ok',
    renderedAt: new Date().toISOString(),
  });
};

export const config = {
  path: '/api/status',
  render: 'server',
  menu: false,
};
```

This route uses `render: 'server'` because it returns request-time status data.

## Registered Components

JavaScript Pages use the same `components` export as Markdown Pages when they render Registered
Components:

```js label="components export"
import { atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';

const acmeChartFile = new URL('../components/AcmeChart.js', import.meta.url).href;

export const components = {
  ...atlasDocComponents,
  'acme-chart': {
    file: acmeChartFile,
    className: 'AcmeChart',
    loading: 'hydrate:onVisible',
  },
};
```

Rocket injects the hydration script into `pageData.clientCode`; layouts built with Rocket's
`document` helper include it automatically.

## Common Mistakes

### Constructing PageData manually

```js label="Avoid"
const pageData = {
  title: 'Status',
  content,
  pageTree: { children: [] },
};
```

Use the object from the context instead:

```js label="Use Page context"
export default async (_request, { pageData }) => {
  pageData.content = html`<h1>Status</h1>`;
  return new Response(await ssrRender(atlasDocLayout(pageData, siteData)));
};
```

### Using static mode for request-time Pages

Concrete JavaScript Pages can stay static. Use `render: 'server'` when the Page depends on the
current request or uses route parameters:

```js label="Server-rendered Page config"
export const config = {
  path: '/status/:region',
  render: 'server',
};
```

### Returning the inner content only

```js label="Avoid"
return new Response(await ssrRender(pageData.content));
```

Render the full layout instead:

```js label="Render the layout"
return new Response(await ssrRender(atlasDocLayout(pageData, siteData)));
```

## Next Steps

- Use [Pages](/reference/pages) for the JavaScript Page API.
- Use [Layouts](/reference/layouts) for `pageData` and the document helper.
- Use [Request-time JavaScript Pages](/request-time-javascript-pages) for request-time Pages,
  JSON responses, and generated SVG responses.
