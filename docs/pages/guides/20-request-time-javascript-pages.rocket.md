```js server
export const config = {
  path: '/request-time-javascript-pages',
  metadata: {
    title: 'Add Request-time JavaScript Pages',
    description:
      'Use server-rendered JavaScript Pages when a Rocket response depends on the current request.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Request-time tip',
          description:
            'Start static. Move only the Page that needs route params, headers, live data, or adapter context to render: server.',
        },
      },
    },
  },
  menu: {
    linkText: 'Request-time JS Pages',
    iconName: 'lightning-charge',
    parent: '/guides',
    order: 20,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Request-Time JavaScript Pages

Most Rocket Pages should stay static. Use Markdown Pages for durable content, and use concrete
JavaScript Pages when a route can be rendered once during `rocket build`.

Switch a JavaScript Page to request-time rendering only when the response depends on the incoming
`Request`: route parameters, query strings, headers, cookies, live data, per-request status codes,
generated non-HTML output, or platform data from a deployment adapter.

<section class="request-time-summary" aria-labelledby="request-time-summary-heading">
  <h2 id="request-time-summary-heading">Choose the smallest render mode that fits</h2>
  <div class="request-time-summary-grid">
    <article class="request-time-summary-item">
      <strong>Static first</strong>
      <p>Keep Pages static when the same output can be reused for every visitor.</p>
    </article>
    <article class="request-time-summary-item">
      <strong>Server when the request matters</strong>
      <p>Add <code>render: 'server'</code> for params, headers, cookies, live data, or adapter context.</p>
    </article>
    <article class="request-time-summary-item">
      <strong>Response for route contracts</strong>
      <p>Return a <code>Response</code> when status, headers, cache policy, or content type are part of the API.</p>
    </article>
  </div>
</section>

The examples below use one tiny component catalog and produce five route shapes from it: a static
JSON file, request-time JSON, parameterized JSON, parameterized HTML, and generated SVG. Direct
source-plus-response examples use Request Demo frames so the live `GET` response stays paired with
the source that creates it.

## How Rocket Runs One

Rocket uses the same Page Runtime model in local development, static builds, and deployment
adapters:

1. Page discovery reads every file matched by `includeGlobs` and records each Page by
   `config.path`.
2. The Page Runtime receives a web `Request` and matches its pathname against configured Page
   paths, including `:param` route segments.
3. A Page Module Loader loads the environment-specific module for the matched Page.
4. Rocket creates `pageData` for this render and calls the JavaScript Page with
   `(request, { params, pageData, adapterContext })`.
5. Rocket normalizes the JavaScript Page Result to a `Response`.

<dl class="request-time-return-list" aria-label="JavaScript Page return values">
  <div>
    <dt><code>Response</code></dt>
    <dd>Rocket sends the response exactly as returned.</dd>
  </div>
  <div>
    <dt><code>string</code></dt>
    <dd>Rocket sends HTML with <code>text/html; charset=utf-8</code>.</dd>
  </div>
  <div>
    <dt>plain object or array</dt>
    <dd>Rocket sends JSON through <code>Response.json()</code>.</dd>
  </div>
  <div>
    <dt><code>null</code> or <code>undefined</code></dt>
    <dd>Rocket sends an empty <code>Response</code>.</dd>
  </div>
</dl>

Return a `Response` when you need custom status codes or headers. Otherwise, return the simplest
value that expresses the result.

## Choose The Render Mode

Start with the default static render mode for concrete JavaScript Pages:

```js request-demo url="/request-time-javascript-pages/demo/build-info.json" label="src/pages/build-info.rocket.js" height=180
/** @type {import('@rocket/js/types.js').JsPage} */
export default async request => ({
  path: new URL(request.url).pathname,
  generatedAt: new Date().toISOString(),
});

export const config = {
  path: '/build-info.json',
  metadata: { title: 'Build info' },
  menu: false,
};
```

During `rocket build`, Rocket creates one build-time `Request` for `/build-info.json` and writes the
JSON response to static output. The Request Demo uses this guide's namespaced demo route so the
static JSON response can be inspected in place.

Static JavaScript Pages are rendered once per concrete `config.path`. Do not make static output
depend on query strings, because a static build does not generate separate files for query variants.
If a Request Demo needs query-specific output, point it at a Page with `render: 'server'`.

Add `render: 'server'` when the Page needs request-time behavior or when the path contains route
parameters:

```js label="Server-rendered Page config"
export const config = {
  path: '/api/components/:componentName.json',
  render: 'server',
  menu: false,
};
```

Parameterized JavaScript Pages need `render: 'server'` today because Rocket does not yet have a
static params enumeration API.

## Share Request Data

Keep reusable facts in ordinary modules. Pages should import those modules instead of duplicating
lookup tables across API, HTML, and image routes:

```js label="src/componentCatalog.js"
export const componentCatalog = [
  {
    slug: 'button',
    name: 'Button',
    status: 'stable',
    summary: 'A link-style action for navigation and setup tasks.',
    variants: ['primary', 'secondary'],
  },
  {
    slug: 'callout',
    name: 'Callout',
    status: 'preview',
    summary: 'A short notice block for guidance, warnings, and success messages.',
    variants: ['info', 'warning', 'success'],
  },
];

export function findComponent(slug) {
  return componentCatalog.find(component => component.slug === slug);
}
```

This keeps the request-time Page focused on request handling while the domain data remains easy to
test and reuse from static Pages.

## Return JSON

For a simple JSON endpoint, return a plain object and let Rocket normalize it:

```js request-demo url="/request-time-javascript-pages/demo/api/components.json" label="src/pages/api/components.rocket.js"
import { componentCatalog } from '../../componentCatalog.js';

/** @type {import('@rocket/js/types.js').JsPage} */
export default async request => {
  const url = new URL(request.url);

  return {
    path: url.pathname,
    generatedAt: new Date().toISOString(),
    components: componentCatalog,
  };
};

export const config = {
  path: '/api/components.json',
  metadata: { title: 'Components API' },
  render: 'server',
  menu: false,
};
```

This Page uses `render: 'server'` because `generatedAt` should be evaluated for each request. If the
data should be captured once during the build, remove `render: 'server'`.

## Read Route Parameters

Parameterized routes expose their dynamic segments through `context.params`:

```js request-demo url="/request-time-javascript-pages/demo/api/components/button.json" label="src/pages/api/component.rocket.js" height=190
import { findComponent } from '../../componentCatalog.js';

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (_request, { params }) => {
  const componentName = params.componentName || '';
  const component = findComponent(componentName);

  if (!component) {
    return Response.json(
      {
        error: 'Component not found',
        componentName,
      },
      { status: 404 },
    );
  }

  return {
    slug: componentName,
    ...component,
  };
};

export const config = {
  path: '/api/components/:componentName.json',
  metadata: { title: 'Component API' },
  render: 'server',
  menu: false,
};
```

Use `menu: false` for API routes and parameterized routes that do not have a single concrete link
target. The same Page file handles both matching and missing component names. The 404 branch returns
a `Response` so the status code is part of the route contract:

```js request-demo url="/request-time-javascript-pages/demo/api/components/unknown.json" label="src/pages/api/component.rocket.js 404 branch" height=150
if (!component) {
  return Response.json(
    {
      error: 'Component not found',
      componentName,
    },
    { status: 404 },
  );
}
```

## Render HTML With PageData

When a JavaScript Page returns HTML, use the `pageData` Rocket creates for the current request.
Set `pageData.content`, render a layout, and return the rendered string:

```js request-demo url="/request-time-javascript-pages/demo/playground/button" label="src/pages/playground.rocket.js" height=360
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { layout } from '@rocket/js/layout.js';
import { findComponent } from '../componentCatalog.js';

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (request, context) => {
  const component = findComponent(context.params.componentName);

  if (!component) {
    return new Response('Component not found', { status: 404 });
  }

  const url = new URL(request.url);
  const apiPath = `/api/components/${component.slug}.json`;

  context.pageData.title = `${component.name} Playground`;
  context.pageData.content = html`
    <h1>${component.name} Playground</h1>
    <p>${component.summary}</p>

    <h2>Variants</h2>
    <ul>
      ${component.variants.map(variant => html`<li>${variant}</li>`)}
    </ul>

    <p>Metadata for this component is available from <a href=${apiPath}>${apiPath}</a>.</p>

    <p>Rendered for <code>${url.pathname}</code>.</p>
  `;

  return ssrRender(layout(context.pageData));
};

export const config = {
  path: '/playground/:componentName',
  metadata: { title: 'Component playground' },
  render: 'server',
  menu: false,
};
```

The `:componentName` segment becomes `context.params.componentName`, so `/playground/button` and
`/playground/callout` render different HTML from one Page file.

Rocket finalizes HTML responses after your function returns. That means Rocket-owned icon output
and other Page Runtime finishing work still apply to HTML returned from JavaScript Pages.

## Return Non-HTML Responses

Use a `Response` when the content type, cache policy, or status is part of the route contract:

```js request-demo url="/request-time-javascript-pages/demo/open-graph/button.svg" label="src/pages/open-graph.rocket.js" height=378
import { findComponent } from '../componentCatalog.js';

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (request, context) => {
  const component = findComponent(context.params.componentName);

  if (!component) {
    return new Response('Component not found', { status: 404 });
  }

  const name = escapeSvg(component.name);
  const summary = escapeSvg(component.summary);
  const status = escapeSvg(component.status);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img">
  <rect width="1200" height="630" fill="#0f172a" />
  <rect x="72" y="72" width="1056" height="486" rx="28" fill="#f8fafc" />
  <text x="120" y="180" fill="#0f766e" font-family="Arial, sans-serif" font-size="36">
    Acme UI Docs
  </text>
  <text x="120" y="300" fill="#111827" font-family="Arial, sans-serif" font-size="96" font-weight="700">
    ${name}
  </text>
  <text x="120" y="380" fill="#334155" font-family="Arial, sans-serif" font-size="34">
    ${summary}
  </text>
  <text x="120" y="472" fill="#0f766e" font-family="Arial, sans-serif" font-size="30">
    Status: ${status}
  </text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};

function escapeSvg(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export const config = {
  path: '/open-graph/:componentName.svg',
  metadata: { title: 'Component Open Graph Image' },
  render: 'server',
  menu: false,
};
```

This Page returns SVG instead of HTML, so Rocket sends the `Response` exactly as returned.

## Configure The Production Adapter

Request-time Pages work in local development through Rocket's dev server. A production build needs
an adapter when any Page uses `render: 'server'`:

```js label="rocket-config.js"
import { netlify } from '@rocket/js/adapters/netlify.js';

/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['src/pages/**/*.rocket.{md,js}'],
  adapter: netlify(),
};
```

Without an adapter, `rocket build` fails early when it finds server-rendered Pages. With the
Netlify adapter configured, Rocket still writes static Pages to `dist/` and also bundles
server-rendered Pages into a Netlify Function. The generated function creates a Page Runtime and
passes Netlify's request context through as `context.adapterContext`.

For production settings, generated output, and Netlify-specific verification, see
[Netlify Adapter](/netlify-adapter).

## Checkpoint

Run the site:

```bash
npm run start
```

Then visit the routes your own project defines:

<ul class="request-time-route-list">
  <li><code>/build-info.json</code><span>Static JSON rendered during the build.</span></li>
  <li><code>/api/components.json</code><span>Request-time JSON rendered for each request.</span></li>
  <li><code>/api/components/button.json</code><span>Parameterized JSON using <code>context.params</code>.</span></li>
  <li><code>/api/components/unknown.json</code><span>Parameterized 404 JSON returned as a <code>Response</code>.</span></li>
  <li><code>/playground/button</code><span>Parameterized HTML rendered through a layout.</span></li>
  <li><code>/open-graph/button.svg</code><span>Generated non-HTML output returned as a <code>Response</code>.</span></li>
</ul>

This docs page uses namespaced demo routes:

<ul class="request-time-route-list">
  <li><code>/request-time-javascript-pages/demo/build-info.json</code></li>
  <li><code>/request-time-javascript-pages/demo/api/components.json</code></li>
  <li><code>/request-time-javascript-pages/demo/api/components/button.json</code></li>
  <li><code>/request-time-javascript-pages/demo/api/components/unknown.json</code></li>
  <li><code>/request-time-javascript-pages/demo/playground/button</code></li>
  <li><code>/request-time-javascript-pages/demo/open-graph/button.svg</code></li>
</ul>

Then run the production build:

```bash
npm run build
```

The site now mixes static Pages for durable content and request-time JavaScript Pages for
request-shaped responses without changing how Pages are discovered.

## Next step

Continue with [Deploy](/deploy) to build and publish the static output, plus any adapter output your
request-time JavaScript Pages require.
