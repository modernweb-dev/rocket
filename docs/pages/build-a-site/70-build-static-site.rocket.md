```js server
export const config = {
  path: '/tutorials/acme-ui-docs/build-static-site',
  metadata: {
    title: 'Build the static site',
    description: 'Build the completed Acme UI Docs site into production-ready static output.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Build tip',
          description:
            'Inspect dist/ before deploying; the output should contain the pages, copied assets, and static HTML you expect.',
        },
      },
    },
  },
  menu: {
    iconName: 'box-arrow-up',
    parent: '/tutorials',
    order: 70,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Build the Static Site

The Acme UI Docs project now has Pages, user-owned site data, a docs layout wrapper, menu structure,
Site Head Metadata, brand assets, and the first documented component.

## Run the production build

```bash
npm run build
```

Rocket writes the static output to `dist/`.

## Inspect the output

Check that the important Pages exist:

```bash
ls dist
ls dist/components/button
ls dist/brand
```

Then preview the built files with any static file server. For example:

```bash
npx --yes http-server dist
```

Visit these paths in the preview server:

- `/`
- `/getting-started`
- `/brand`
- `/components/button`

## Final project shape

Your project should now look like this:

```txt
acme-ui-docs/
├── package.json
├── rocket-config.js
├── public/
│   └── favicon.svg
├── docs/
│   ├── assets/
│   │   ├── acme-mark.svg
│   │   └── acme-wordmark.svg
│   ├── docsLayout.js
│   ├── pages/
│   │   ├── brand.rocket.md
│   │   ├── components/
│   │   │   └── index.rocket.md
│   │   ├── getting-started.rocket.md
│   │   └── index.rocket.md
│   └── siteData.js
├── src/
│   └── components/
│       ├── AcmeButton.js
│       └── AcmeButton.rocket.md
└── .agents/
    └── skills/
        └── rocket/
            └── SKILL.md
```

The `.agents/skills/rocket/SKILL.md` file is created by `rocket init`. Keep it if you use a coding
agent on the project; remove it if you do not need project-local agent instructions.

## Where to go next

- Continue with [Component Loading](/component-loading) when you document components that need
  browser behavior.
- Continue with [Request-time JavaScript Pages](/request-time-javascript-pages) when part of
  the Acme UI Docs site should respond to request params.
- Use [Pages](/reference/pages) when you add sections, guides, and API reference.
- Use [Menus](/advanced/menus) when the navigation order needs refinement.
- Use [Assets](/reference/assets) when Pages need more images or CSS.
- Use [Deploy](/deploy) when you are ready to publish.

## Checkpoint

The static-site chapter ends with complete static documentation output. Every file under `src/` is
owned by the Acme UI Docs project, every file under `docs/` is owned by the Acme UI Docs
documentation site, and Rocket supplies the build pipeline plus the reusable Atlas docs layout.
