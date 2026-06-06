```js server
export const config = {
  path: '/help/troubleshooting',
  metadata: {
    title: 'Troubleshooting',
    description: 'Map Rocket build and dev-server symptoms to likely causes and fixes.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Debugging tip',
          description:
            'Reproduce the issue in a clean terminal first; the full dev-server output usually points to the failing Page, component, or asset.',
        },
      },
    },
  },
  menu: {
    iconName: 'tools',
    order: 10,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Troubleshooting

Use this page to map a symptom to the part of Rocket most likely involved. When in doubt, first run
the dev server from a clean terminal so you can see the full error output.

## Dev server will not start

Check the Node.js version:

```bash
node --version
```

Rocket requires Node.js 22 or newer.

Confirm `rocket-config.js` has a default export:

```js label="rocket-config.js"
export default {
  includeGlobs: ['docs/**/*.rocket.{md,js}'],
};
```

If port `8888` is already in use, change it with `adjustDevServerConfig`:

```js label="rocket-config.js"
export default {
  includeGlobs: ['docs/**/*.rocket.{md,js}'],
  adjustDevServerConfig: config => ({
    ...config,
    port: 3000,
  }),
};
```

If the error includes `EMFILE`, the environment has too many file watchers open. Retry without
automatic watchers or browser opening:

```bash
npm start -- --no-watch --no-open
```

## Page is missing

Likely causes:

- The file does not match `includeGlobs`.
- The file extension is not `.rocket.md` or `.rocket.js`.
- The Page does not export `config.path`.
- Another Page already uses the same `config.path`.
- The Page was added under a directory that is not currently watched.

Fixes:

```bash
npx rocket start
```

Then press `Ctrl+R` in the terminal to restart after adding new directories or changing config.

If the Page works in a browser but returns 404 with plain `curl`, send an HTML accept header:

```bash
curl -H 'Accept: text/html' http://localhost:8888/docs
```

## Page is not in the menu

Check the Page config:

```js label="Page config"
export const config = {
  path: '/api/components',
  menu: false,
};
```

`menu: false` hides a Page from the tree. `menu.noLink` keeps it visible but non-clickable.
Parameterized Pages should usually use `menu: false`.

If the Page appears in the wrong group, check `menu.parent`.

## Table of contents fails

Markdown Pages may have only one `h1`. The table-of-contents tree also expects heading levels to
move one level at a time.

This is valid:

```md
# Page

## Section

### Detail
```

This can fail:

```md
# Page

#### Detail
```

Use `menu-exclude` when a heading should not appear in the table of contents.

## JavaScript Page build fails

A JavaScript Page with a concrete `config.path` can build as static output. If the failing Page path
contains route parameters, Rocket cannot render one static document for every possible value yet.
Set `render: 'server'` and configure an adapter:

```js label="Parameterized Page config"
export const config = {
  path: '/api/:name',
  render: 'server',
  menu: false,
};
```

Without an adapter, `rocket build` fails when it finds server-rendered Pages. If the Page is meant
to stay static, keep `render` unset or set it to `'static'`, and use a concrete path such as
`/api/time`.

## Server-rendered Page returns the wrong type

A JavaScript Page may return a `Response`, string, plain object, `null`, or `undefined`.

If you need custom status or headers, return a `Response` directly:

```js label="JavaScript Page response"
export default async () => {
  return new Response('Not found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
```

## Custom element is unregistered

Rocket validates authored custom element tags in Markdown Pages. For a tag such as
`<acme-card></acme-card>`, the Page must either register it:

```js label="components export"
const acmeCardFile = new URL('../components/AcmeCard.js', import.meta.url).href;

export const components = {
  'acme-card': {
    file: acmeCardFile,
    className: 'AcmeCard',
    loading: 'server',
  },
};
```

Or define it as a Page-local Custom Element:

````markdown
```js client
class AcmeCard extends HTMLElement {}
customElements.define('acme-card', AcmeCard);
```
````

The tag name in `customElements.define` must be a literal string. Computed tag names are not
accepted as Page-local ownership.

## Registered Component does not render

Check:

- `className` matches an actual export from the component module.
- `file` points to the module Rocket should import. For Page-owned project files, use
  `new URL(..., import.meta.url).href`.
- The component module does not call `customElements.define`.
- Browser-only APIs are guarded when the Loading Strategy is `server` or `hydrate:*`.

For browser-only components, use `loading: 'client'`.

## Hydration does not run

Check the Loading Strategy:

```js label="Hydration values"
loading: 'hydrate:onVisible';
loading: 'hydrate:onClick';
loading: "hydrate:onMedia('(max-width: 768px)')";
```

For `hydrate:onMedia`, include the media query in quotes inside the strategy string.

Use the browser Network tab to confirm the component module was requested when the condition should
resolve. Use the Console tab to check for errors while upgrading the custom element.

## Assets 404

Prefer `resolve` for browser-facing source assets:

```js label="Page server code"
import { resolve } from '@rocket/js/resolve.js';

const logo = resolve('../assets/logo.svg', import.meta);
```

For Registered Component modules, use `new URL(..., import.meta.url).href` instead:

```js label="components export"
const componentFile = new URL('../components/AcmeCard.js', import.meta.url).href;
```

If a package asset fails to resolve, check that the package exposes it through its `exports` map.

## Standalone Demo URL fails

Standalone Demo URLs use this shape:

```text
<page path>/_demo/<demo export name>/
```

Check:

- The demo is a named export from a `js demo` block.
- The URL includes the trailing slash.
- No configured Page collides with the generated `_demo` path.
- The parent Page is a Markdown Page.

## Debugging tips

Add focused logging in the failing layer:

```js label="layout debug logging"
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => {
  console.log('Page title:', pageData.title);
  return atlasDocLayout(pageData, globalData);
};
```

For JavaScript Pages, log the request and params:

```js label="Page debug logging"
export default async (request, context) => {
  console.log(new URL(request.url).pathname, context.params);
  return 'ok';
};
```

Remove temporary logging before committing.

## Getting help

When opening an issue or asking in Discord, include:

- Rocket version from `npm list @rocket/js`.
- Node.js version from `node --version`.
- Operating system.
- The relevant `rocket-config.js`.
- The failing Page file or a minimal reproduction.
- Full error output.

Support links:

- [GitHub Issues](https://github.com/modernweb-dev/rocket/issues)
- [Discord Community](https://discord.gg/sTdpM2rkKJ)
- [GitHub Discussions](https://github.com/modernweb-dev/rocket/discussions)
