```js server
export const config = {
  path: '/reference/assets',
  metadata: {
    title: 'Assets',
    description:
      'Reference project and package assets reliably during development and production builds.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Asset tip',
          description:
            'Use public/ for stable URL assets and resolve() for package or source assets that Rocket should copy into the build.',
        },
      },
    },
  },
  menu: {
    iconName: 'image',
    order: 80,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Assets

Rocket can reference project files and package assets from Page server code, layouts, and component
registration. For source files that must survive both development and production builds, use
`resolve` or `new URL(..., import.meta.url).href` instead of guessing the final output path.

## Public Assets

Use `public/` for files that should be published at stable root-relative URLs without becoming
Pages:

```txt
public/
|-- favicon.svg
|-- apple-touch-icon.png
|-- downloads/spec.pdf
`-- .well-known/security.txt
```

During `rocket start`, `public/favicon.svg` is served at `/favicon.svg`. During `rocket build`,
Rocket copies the same file to `dist/favicon.svg`.

Public Assets are copied and served verbatim. Rocket does not transform, fingerprint, bundle, or add
them to the Sitemap. Reference them directly by their public path:

```js label="rocket-config.js"
export default {
  includeGlobs: ['src/pages/**/*.rocket.{md,js}'],
  siteHeadMetadata: {
    siteName: 'Acme Docs',
    defaultDescription: 'Guides and reference for Acme UI.',
    language: 'en',
    icons: {
      svg: '/favicon.svg',
    },
  },
};
```

Public Asset URLs cannot collide with Page URLs or Rocket-generated outputs such as `sitemap.xml`,
`robots.txt`, Standalone Demo URLs, generated archive Pages, Default Social Preview Images, Redirect
fallback files, or adapter outputs such as Netlify `_redirects`.

Files under hidden dot paths are ignored by default, except for `.well-known`. Symlinks are rejected
because Public Assets must be regular files.

## Page and layout assets

Use `resolve` from `@rocket/js/resolve.js` for files that should become browser URLs:

````markdown
```js server
import { html } from 'lit';
import { resolve } from '@rocket/js/resolve.js';

export const config = {
  path: '/brand',
  metadata: { title: 'Brand' },
};

const mark = resolve('../assets/acme-mark.svg', import.meta);
const styles = resolve('../assets/brand.css', import.meta);

export const layout = pageData => html`
  <!doctype html>
  <html>
    <head>
      <title>${pageData.title}</title>
      <link rel="stylesheet" href="${styles}" />
      ${pageData.clientCode}
    </head>
    <body>
      ${pageData.content}
    </body>
  </html>
`;
```

# Brand

<img src="${mark}" alt="Acme mark" />
````

`resolve` accepts relative specifiers and package specifiers. It resolves them from the module that
calls it.

## Package assets

Package assets work when the package exposes them through `exports`:

```json
{
  "name": "acme-ui",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./assets/*": "./src/assets/*"
  }
}
```

Then a Page can reference the asset through the package name:

```js label="Page server code"
import { resolve } from '@rocket/js/resolve.js';

const logo = resolve('acme-ui/assets/logo.svg', import.meta);
```

Rocket's own docs use the same pattern for package assets:

```js label="Package asset reference"
const logo = resolve('@rocket/js/docs/assets/rocket-logo-light.svg', import.meta);
```

## Component files

Registered Component `file` values are module specifiers, not image URLs. For project components
owned by a Page, prefer an absolute file URL:

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

Use `resolve` for browser-facing assets. Use `new URL(..., import.meta.url).href` for component
module files that Rocket imports.

## Markdown images

Markdown images are useful for external URLs and already-public paths:

```md
![Rocket logo](https://example.com/rocket.svg)
![Local file already served at the site root](/assets/logo.svg)
```

For source-controlled project assets that live next to Pages or components, prefer resolving the
path in `js server` and using the resolved value in HTML:

````markdown
```js server
import { resolve } from '@rocket/js/resolve.js';

const diagram = resolve('../assets/architecture.svg', import.meta);
```

<img src="${diagram}" alt="Architecture diagram" />
````

## CSS assets

CSS linked from a layout can also use `resolve`:

```js label="layout.js"
import { html } from 'lit';
import { resolve } from '@rocket/js/resolve.js';

const cssPath = resolve('../assets/docs.css', import.meta);

export const layout = pageData => html`
  <!doctype html>
  <html>
    <head>
      <link rel="stylesheet" href="${cssPath}" />
      ${pageData.clientCode}
    </head>
    <body>
      ${pageData.content}
    </body>
  </html>
`;
```

If the CSS itself references other files with `url(...)`, keep those paths relative to the CSS file
or use package assets that your bundler can resolve.

## Troubleshooting

- Broken in production but not development: replace hand-written relative URLs with `resolve`.
- Stable root asset request 404s: put the file under `public/` and reference it with a
  root-relative URL such as `/favicon.svg`.
- Package asset fails to resolve: check the package `exports` map.
- Component file fails to import: use `new URL(..., import.meta.url).href` from the Page module.
- Asset request 404s in development: confirm the request path is relative to the Page source file or
  use a resolved URL.
