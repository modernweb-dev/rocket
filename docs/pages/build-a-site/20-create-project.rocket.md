```js server
export const config = {
  path: '/tutorials/acme-ui-docs/create-project',
  metadata: {
    title: 'Create the project shell',
    description: 'Create the Rocket project shell with one working page and docs layout wiring.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Setup tip',
          description:
            'Create one working page before adding content depth; it proves config, layout data, and assets are wired correctly.',
        },
      },
    },
  },
  menu: {
    iconName: 'folder-plus',
    parent: '/tutorials',
    order: 20,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Create the Project Shell

Start with a new Rocket project and one working page. This first checkpoint already uses Rocket's
docs layout affordances, but the project data and content are owned by your Acme UI Docs site.

## Create the package

```bash
mkdir acme-ui-docs
cd acme-ui-docs
npm init -y
npm install @rocket/js
npx rocket init
```

`rocket init` creates the first Rocket files and adds local development and static build scripts
when those script names are available. It also creates a removable project-local Rocket Agent Skill
under `.agents/skills/rocket/SKILL.md`:

```json
{
  "type": "module",
  "scripts": {
    "start": "rocket start",
    "build": "rocket build"
  },
  "dependencies": {
    "@rocket/js": "^0.1.0"
  }
}
```

## Add Rocket config

Update `rocket-config.js` in the project root:

```js label="rocket-config.js"
/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/pages/**/*.rocket.{md,js}', 'src/**/*.rocket.{md,js}'],
  siteOrigin: 'https://docs.acme.example',
  siteHeadMetadata: {
    siteName: 'Acme UI Docs',
    defaultDescription: 'Guides and reference for Acme UI components.',
    language: 'en',
  },
};
```

Rocket discovers Pages from `includeGlobs`. The URL for each Page still comes from that Page's
`config.path`, not from the file name. See [Pages](/reference/pages) when you want the full routing
model. General documentation Pages belong under `docs/pages`; component reference Pages can live
near the component they document under `src`.

`siteHeadMetadata` gives Rocket's document helper the shared browser and social metadata used by
the current Atlas layout. Replace `siteOrigin` with the real deployed origin before publishing.

## Add the first user-owned asset

Create `docs/assets/acme-mark.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Acme UI">
  <rect width="48" height="48" rx="10" fill="#0f766e" />
  <path d="M14 33 24 12l10 21h-6l-2-5h-4l-2 5h-6Zm10-16-3 7h6l-3-7Z" fill="white" />
</svg>
```

This is user-owned branding. Rocket's docs layout can display it, but it does not come from
Rocket's docs site.

## Add site data

Create `docs/siteData.js`:

```js label="docs/siteData.js"
import { resolve } from '@rocket/js/resolve.js';

/** @type {import('@rocket/js/types.js').DocData} */
export const siteData = {
  headerData: {
    logo: [resolve('./assets/acme-mark.svg', import.meta)],
    homeLink: '/',
    navLinks: [],
    socials: [],
  },
  footerData: [],
  navigationIconServerBudget: 35,
};
```

The `resolve` helper turns a user-owned asset into a URL that works in development and in the
static build. For more asset patterns, see [Assets](/reference/assets).

`DocData` is the data shape the Atlas docs layout reads. The docs layout uses `headerData` and
`navigationIconServerBudget`; keep `footerData` as an empty array until a layout needs footer
sections.

## Wrap the docs layout

Create `docs/docsLayout.js`:

```js label="docs/docsLayout.js"
import { atlasDocComponents, atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
import { siteData } from './siteData.js';

export { atlasDocComponents };

export const components = atlasDocComponents;
export const layout = pageData => atlasDocLayout(pageData, siteData);
```

`atlasDocLayout` and `atlasDocComponents` are Rocket-owned layout affordances. The wrapper is
user-owned, so your Pages import one local layout boundary instead of importing Rocket's own docs
site data.

## Create the home Page

Replace the generated `docs/pages/index.rocket.md` with the Acme UI home Page:

````markdown
```js server
export const config = {
  path: '/',
  metadata: {
    title: 'Acme UI Docs',
    description: 'Guides and reference for Acme UI components.',
  },
  menu: {
    order: 10,
    iconName: 'house',
  },
};

import { layout } from '../docsLayout.js';
export { components } from '../docsLayout.js';
```

# Acme UI Docs

Acme UI is a small component system for product documentation.

## Start here

Use these docs to learn the design tokens, copy patterns, and component APIs that make Acme
interfaces consistent.
````

## Checkpoint

Run the static build:

```bash
npm run build
```

You now have a coherent Rocket site with one Page, a user-owned asset, user-owned site data, and a
local wrapper around Rocket's current Atlas docs layout. The document metadata comes from
`rocket-config.js`; the Atlas header and navigation icon budget come from `docs/siteData.js`.
