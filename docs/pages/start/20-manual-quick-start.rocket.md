```js server
export const config = {
  path: '/setup/manual-quick-start',
  metadata: {
    title: 'Manual Quick Start',
    description: 'Create a minimal Rocket project with config, one Page, and dev server.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Quick start tip',
          description:
            'Keep the first project minimal until npm run start and npm run build both work.',
        },
      },
    },
  },
  menu: {
    linkText: 'Manual Quick Start',
    iconName: 'clock',
    order: 20,
  },
};
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Manual Quick Start

Create a small Rocket documentation starter with Atlas layouts, example Pages, and a local dev
server.

<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  Rocket requires Node.js 22 or newer. Check your version with <code>node --version</code>.
</wa-callout>

## Create a Project

Create a directory and initialize npm:

```bash
mkdir my-rocket-site
cd my-rocket-site
npm init -y
```

Install Rocket:

```bash
npm install @rocket/js
```

Initialize the Rocket files:

```bash
npx rocket init
```

The initializer creates a compact Atlas docs starter. It does not overwrite existing files, install
dependencies, or run a build.

If an existing `package.json` explicitly says `"type": "commonjs"`, Rocket stops before writing
files. Change it to `"type": "module"` and rerun `npx rocket init`, or run
`npx rocket init --yes` when you want Rocket to apply that package change.

## Check the Config

`rocket-config.js` includes the general documentation Pages under `docs/pages` and colocated
component reference Pages under `src`:

```js label="rocket-config.js"
/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/pages/**/*.rocket.{md,js}', 'src/**/*.rocket.{md,js}'],
};
```

`includeGlobs` tells Rocket which files can become Pages.

`rocket init` also adds npm scripts when those names are available:

```json
{
  "scripts": {
    "start": "rocket start",
    "build": "rocket build"
  }
}
```

## Check the Starter Pages

The generated files include:

- `docs/pages/sharedData.js`
- `public/rocket-theme.css`
- `docs/pages/index.rocket.md`
- `docs/pages/docs.rocket.md`
- `docs/pages/javascript-demo.rocket.md`
- `docs/pages/request-demo.rocket.md`
- `docs/pages/site-status.rocket.js`

The home Page uses the package-provided Atlas hero layout:

````markdown
```js server
export const config = {
  path: '/',
  metadata: {
    title: 'Rocket Site',
    description: 'Documentation built with Rocket.',
  },
  menu: {
    iconName: 'house',
    order: 0,
  },
};

import { atlasHeroLayout, atlasHeroComponents } from '@rocket/js/layouts/atlasHero.js';
import { heroData } from './sharedData.js';

export const components = atlasHeroComponents;
export const layout = pageData => atlasHeroLayout(pageData, heroData);
```

# Rocket Site

This starter is rendered with Rocket's Atlas hero layout.
````

The `path` value controls the public URL. This file renders at `/` because `config.path` is `/`.
Atlas docs Pages use `atlasDocLayout` and export `atlasDocComponents`. Pages that appear in the
left navigation include `menu.iconName`, using Bootstrap Icon names.

The generated `docs/pages/sharedData.js` wires `public/rocket-theme.css` into Atlas layout data.
Edit that stylesheet for project-level color variables instead of adding one-off styles to each
Page.

## Run the Dev Server

```bash
npm start
```

Rocket starts a local dev server and opens the site at `http://localhost:8888`.

<wa-callout>
  <rocket-icon slot="icon" name="info-circle"></rocket-icon>
  The dev server reloads after page changes. If a new Page does not appear, press
  <code>Ctrl+R</code> in the terminal running Rocket to restart the server.
</wa-callout>

If startup fails with `EMFILE`, retry without automatic watchers or browser opening:

```bash
npm start -- --no-watch --no-open
```

## Add One More Page

Create `docs/pages/about.rocket.md`:

````markdown
```js server
export const config = {
  path: '/about',
  metadata: { title: 'About' },
  menu: {
    iconName: 'info-circle',
    order: 40,
  },
};

import { atlasDocLayout, atlasDocComponents } from '@rocket/js/layouts/atlasDoc.js';
import { docData } from './sharedData.js';

export const components = atlasDocComponents;
export const layout = pageData => atlasDocLayout(pageData, docData);
```

# About

This page renders at `/about`.
````

The generated home Page already uses `menu.order: 0`, so this About Page appears after the starter
Pages in the Atlas docs navigation.

## Build the Site

Run a production build:

```bash
npm run build
```

Rocket writes the generated site to `dist/`.

## Next Steps

You now have the project shell that the rest of the docs build on.

Continue with [Build a Site](/tutorials/acme-ui-docs) to turn this starter into a small docs site
with user-owned data, layout, menus, assets, and component documentation. Use
[Troubleshooting](/help/troubleshooting) if the dev server does not start or a Page does not
appear.
