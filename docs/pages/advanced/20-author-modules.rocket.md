```js server
export const config = {
  path: '/advanced/author-modules',
  metadata: {
    title: 'Author Modules',
    description:
      'Choose supported Rocket imports for Pages, layouts, components, and deployment config.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Import tip',
          description:
            'Import from public @rocket/js entry points in Pages and config; avoid reaching into internal source paths.',
        },
      },
    },
  },
  menu: {
    iconName: 'box',
    order: 20,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Author Modules

Rocket exposes several modules from `@rocket/js`. Most Site Authors only need a small set of them.
Use this page to choose imports for Pages, layouts, component registration, and deployment config
without reaching into Rocket's runtime internals.

## Page and layout imports

Use these from Markdown Page `js server` blocks, JavaScript Pages, or layout modules:

| Import                                 | Use it for                                               |
| -------------------------------------- | -------------------------------------------------------- |
| `@rocket/js/types.js`                  | JSDoc types for config, Pages, components, and layouts   |
| `@rocket/js/layout.js`                 | Rocket's default Markdown layout                         |
| `@rocket/js/layout-helper.js`          | The `document` helper for custom layouts                 |
| `@rocket/js/layouts/atlasDoc.js`       | The atlas docs layout and its component map              |
| `@rocket/js/layouts/atlasHero.js`      | The atlas hero layout and its component map              |
| `@rocket/js/layouts/atlasNotFound.js`  | The atlas 404 layout and its component map               |
| `@rocket/js/components/web-awesome.js` | Web Awesome Registered Component map for custom layouts  |
| `@rocket/js/resolve.js`                | Browser-facing URLs for source assets and package assets |
| `@rocket/js/ssr.js`                    | Render Lit templates from JavaScript Pages               |

Page Collections do not need an extra runtime import. Use the `pageData.pages` Page Registry Query
and `pageData.pagination` object that Rocket passes into JavaScript Pages and layouts. Use
`@rocket/js/types.js` only when you want JSDoc types such as `PageCollectionEntry`,
`PagePagination`, or `PageRegistryQueryOptions`.

Common page and layout imports look like this:

```js label="Page and layout imports"
import { html } from 'lit';
import { ssrRender } from '@rocket/js/ssr.js';
import { resolve } from '@rocket/js/resolve.js';
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
```

## Config and deployment imports

Use the Netlify adapter from `rocket-config.js` when the site has server-rendered Pages:

```js label="rocket-config.js"
import { netlify } from '@rocket/js/adapters/netlify.js';

export default {
  includeGlobs: ['src/pages/**/*.rocket.{md,js}'],
  adapter: netlify(),
};
```

Static-only sites do not need an adapter import.

## Component registration imports

Registered Component `file` values are module specifiers or absolute file URLs:

```js label="components export"
const cardFile = new URL('../components/AcmeCard.js', import.meta.url).href;

export const components = {
  'acme-card': {
    file: cardFile,
    className: 'AcmeCard',
    loading: 'server',
  },
};
```

Do not import the component class into the Page just to register it. Rocket imports the component
module from the `file` value.

## Menu component classes

`@rocket/js/menus.js` exports menu custom element classes for advanced custom layouts:

```js label="custom menu imports"
import { RocketMenu, RocketToc } from '@rocket/js/menus.js';
```

Most Pages should use `atlasDocComponents` instead of defining these classes manually. If a custom
layout registers them itself, keep tag names and PageData properties consistent with the menu
components it renders.

## Imports to avoid in normal site code

These modules are exported because Rocket's own runtime, tests, adapters, or low-level extensions
need them, but ordinary Pages and layouts should not usually import them:

| Import family                             | Prefer instead                                    |
| ----------------------------------------- | ------------------------------------------------- |
| `@rocket/js/PageData.js`                  | Use the `pageData` object Rocket passes in        |
| `@rocket/js/page-runtime.js`              | Let the CLI, dev server, build, or adapter render |
| `@rocket/js/pages.js`                     | Configure discovery with `includeGlobs`           |
| `@rocket/js/components.js`                | Export a Page `components` map                    |
| `@rocket/js/component-hydration.js`       | Choose `server`, `client`, or `hydrate:*`         |
| `@rocket/js/hydration/hydrationLoader.js` | Let Rocket emit hydration code                    |
| `@rocket/js/markdownHook.js`              | Use `.rocket.md` Pages through the CLI            |
| `@rocket/js/transform.js`                 | Use Markdown Pages instead of compiling manually  |
| `@rocket/js/wds-plugin.js`                | Use `rocket start` and `adjustDevServerConfig`    |
| `@rocket/js/loaded-page-module.js`        | Let Page Module Loaders normalize Page modules    |

If a project needs one of these directly, it is probably building a custom integration rather than
ordinary site content.

## Related docs

- [Configuration](/reference/configuration) covers `rocket-config.js`.
- [PageData](/reference/page-data) covers `pageData.pages`, Page Collections, and pagination state.
- [Page Collections](/page-collections) shows a blog-scale archive workflow.
- [Layouts](/reference/layouts) covers layout helpers.
- [Atlas Layouts](/advanced/atlas-layouts) covers reusable layout imports.
- [Components](/reference/components) covers Registered Component maps.
