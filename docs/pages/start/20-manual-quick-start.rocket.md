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

Create the smallest useful Rocket project: one config file, one Markdown Page, and a local dev
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

The initializer creates `rocket-config.js`, `docs/pages/index.rocket.md`, and a removable
project-local Rocket Agent Skill at `.agents/skills/rocket/SKILL.md`. It does not overwrite
existing files, install dependencies, or run a build.

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

## Check the First Page

The generated Page lives at `docs/pages/index.rocket.md`:

````markdown
```js server
export const config = {
  path: '/',
  metadata: { title: 'My Rocket Site' },
};

export { layout } from '@rocket/js/layout.js';
```

# Rocket Site

This Page is rendered by Rocket.

## Next steps

- Edit this Page in `docs/pages/index.rocket.md`.
- Add general documentation Pages under `docs/pages`.
- Add component reference Pages next to the components they document.
- Run `npm run build` to verify the site.
````

The `path` value controls the public URL. This file renders at `/` because `config.path` is `/`.

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

## Add One More Page

Create `docs/pages/about.rocket.md`:

````markdown
```js server
export const config = {
  path: '/about',
  metadata: { title: 'About' },
  menu: {
    order: 20,
  },
};

export { layout } from '@rocket/js/layout.js';
```

# About

This page renders at `/about`.
````

Add `menu.order` to the home page if you want it to appear before About:

````markdown
```js server
export const config = {
  path: '/',
  metadata: { title: 'My Rocket Site' },
  menu: {
    order: 10,
  },
};

export { layout } from '@rocket/js/layout.js';
```
````

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
