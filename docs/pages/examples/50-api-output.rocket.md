```js server
export const config = {
  path: '/examples/api-output',
  metadata: {
    title: 'API Output',
    description:
      'Return JSON from JavaScript Pages for docs indexes, feeds, and site integrations.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'API tip',
          description:
            'Return plain objects for simple JSON endpoints; use Response when you need status codes, headers, or non-JSON bodies.',
        },
      },
    },
  },
  menu: {
    iconName: 'braces',
    order: 50,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# API Output

JavaScript Pages can return JSON as the response body. Use this for small metadata endpoints,
documentation indexes, generated feeds, and integration points that belong to the site.

The working API for this example is
[`/examples/api/docs-index.json`](/examples/api/docs-index.json). It returns a JSON index of the
visible documentation Pages from Rocket's `pageData.pageTree`.

The full Page file is `docs/pages/examples/50-docs-index-api.rocket.js`.

## Response shape

The endpoint returns a plain object:

```json
{
  "title": "Rocket Docs Index",
  "source": "/examples/api/docs-index.json",
  "count": 26,
  "pages": [
    {
      "title": "Start with AI",
      "url": "/setup/build-with-ai",
      "section": "Start"
    }
  ]
}
```

The exact `count` and `pages` values follow the discovered Pages in the current build.

## Static JSON Page

Create a JavaScript Page with a file-style path and return a JSON-compatible value:

```js label="docs/pages/examples/50-docs-index-api.rocket.js"
/** @type {import('@rocket/js/types.js').JsPage} */
export default async (_request, { pageData }) => {
  return {
    title: 'Rocket Docs Index',
    pages: pageData.pageTree.children.map(page => ({
      title: page.linkText,
      url: page.url,
    })),
  };
};

export const config = {
  path: '/api/docs-index.json',
  metadata: { title: 'Docs Index API' },
  menu: false,
};
```

The `.json` extension matters for static output. Rocket treats extension paths as file outputs and
writes this response to `dist/api/docs-index.json`. Extensionless paths are document outputs, so
`/api/docs-index` would build to `dist/api/docs-index/index.html`.

`menu: false` keeps the API route out of site navigation.

## Dynamic JSON API

Use a parameterized JavaScript Page when one Page should return different JSON for different URLs.
The working dynamic API for this example is:

- [`/examples/api/components/button.json`](/examples/api/components/button.json)
- [`/examples/api/components/callout.json`](/examples/api/components/callout.json)
- `/examples/api/components/unknown.json`

The full Page file is `docs/pages/examples/60-component-api.rocket.js`.

```js label="docs/pages/examples/60-component-api.rocket.js"
const components = new Map([
  [
    'button',
    {
      name: 'Button',
      status: 'stable',
      loading: 'server',
      summary: 'A link-style action for navigation and setup tasks.',
    },
  ],
]);

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (_request, { params }) => {
  const componentName = params.componentName || '';
  const component = components.get(componentName);

  if (!component) {
    return Response.json(
      {
        error: 'Component not found',
        componentName,
      },
      { status: 404 },
    );
  }

  return Response.json({
    slug: componentName,
    ...component,
  });
};

export const config = {
  path: '/api/components/:componentName.json',
  render: 'server',
  menu: false,
};
```

The `:componentName` segment becomes `params.componentName`. For
`/api/components/button.json`, the value is `button`.

This Page uses `render: 'server'` because it has a parameterized path. Rocket cannot emit every
possible component detail file during a static build unless the Page has a concrete path.

## Return a Plain Object

When a JavaScript Page returns a plain object, Rocket normalizes it with `Response.json`:

```js label="Plain object response"
export default async () => {
  return {
    status: 'ok',
    format: 'json',
  };
};
```

Use this for ordinary JSON responses where the default JSON headers are enough.

## Return a Response

Return a `Response` directly when the API needs status codes or custom headers:

```js label="Response return value"
export default async () => {
  return Response.json(
    { status: 'ok' },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
};
```

The static builder preserves the response body for file outputs. Deployed headers are controlled by
the hosting target for static files, so use server rendering when response-specific headers are part
of the API contract.

## Static or Server-rendered

Use a static JavaScript Page when the API can be produced once during `rocket build`, such as a
docs index generated from known Pages. Static JSON output works well for:

- documentation indexes
- version manifests
- generated feeds
- package or component metadata checked into the project

Use `render: 'server'` when the API depends on the current request, route parameters, credentials,
adapter context, or live external data:

```js label="Server-rendered API config"
export const config = {
  path: '/api/components/:componentName.json',
  render: 'server',
  menu: false,
};
```

Server-rendered API Pages work in development and need a production adapter for deployed builds.

## Related docs

- [JavaScript Pages With Layouts](/examples/js-pages-with-layout) compares HTML and JSON responses.
- [Pages](/reference/pages) documents JavaScript Page return values and render modes.
- [Request-time JavaScript Pages](/request-time-javascript-pages) covers request-time APIs.
