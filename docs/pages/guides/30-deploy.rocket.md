```js server
export const config = {
  path: '/deploy',
  metadata: {
    title: 'Deploy',
    description: 'Build and publish Rocket static output and adapter-backed server pages.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Deploy tip',
          description:
            'Static-only output can go to any file host; add an adapter only when at least one Page uses server rendering.',
        },
      },
    },
  },
  menu: {
    linkText: 'Deploy',
    iconName: 'cloud-upload',
    parent: '/guides',
    order: 30,
  },
};
import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Deploy a Rocket Site

Once your site has content, run a production build and publish the generated output. A Rocket build
can produce two kinds of output:

- static files in `dist/`
- adapter output for any Pages that use `render: 'server'`

Static-only sites can deploy anywhere that serves files. Sites with Server-rendered JavaScript Pages
need a production adapter so request-time routes have somewhere to run.

## Build

Run:

```bash
npx rocket build
```

Rocket bundles pages, images, styles, and browser modules into `dist/`. If the project has a
configured adapter and at least one server-rendered route, the adapter may also write hosting
specific output.

If your `package.json` has a build script, use that instead:

```bash
npm run build
```

## Deploy a static-only Netlify site

For a site with no `render: 'server'` Pages:

1. [Create a Netlify account](https://docs.netlify.com/start/overview/).
2. Start a new project.
3. Choose **"Deploy manually"**.
4. Drag your `dist/` folder into the upload area.

Netlify serves the generated files as a static site.

## Deploy server-rendered Pages on Netlify

When a Page opts into request-time rendering, configure the Netlify adapter in `rocket-config.js`:

```js label="rocket-config.js"
import { netlify } from '@rocket/js/adapters/netlify.js';

export default {
  includeGlobs: ['docs/**/*.rocket.{md,js}'],
  adapter: netlify(),
};
```

Then mark request-time Pages with `render: 'server'`:

```js label="Server-rendered Page config"
export const config = {
  path: '/api/time',
  render: 'server',
};
```

After `npx rocket build`, Rocket keeps static Pages in `dist/` and generates a Netlify Function in
`.netlify/v1/functions/rocket-ssr.mjs` for server-rendered routes.

Deploy this kind of site through Netlify Git integration or Netlify CLI so both `dist/` and the
generated function are included. Uploading only `dist/` publishes the static Pages but cannot serve
the server-rendered routes.

See [Netlify Adapter](/netlify-adapter) for the full adapter reference and verification checklist.

## Pre-deploy checklist

- Run `npm run build` or `npx rocket build` locally.
- Confirm the expected static routes exist in `dist/`.
- If the site has `render: 'server'` Pages, confirm `.netlify/v1/functions/rocket-ssr.mjs` exists.
- Deploy with the same Node.js major version used locally. Rocket requires Node.js 22 or newer.

## Keep learning

- Use [Reference](/reference/core-concepts) when you need a specific Rocket concept or option.
- Use [Examples](/examples/callout) when you want to compare working implementation patterns.
