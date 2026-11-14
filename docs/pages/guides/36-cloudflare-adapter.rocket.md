```js server
export const config = {
  path: '/cloudflare-adapter',
  metadata: {
    title: 'Cloudflare Adapter',
    description:
      'Run a Cloudflare Worker inside rocket start and deploy Rocket output to Workers Static Assets.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Adapter tip',
          description:
            'Keep Worker paths under one prefix such as /api/*, and keep Rocket Pages outside it.',
        },
      },
    },
  },
  menu: {
    linkText: 'Cloudflare Adapter',
    iconName: 'cloud-check',
    parent: '/guides',
    order: 36,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Cloudflare Adapter

The Cloudflare adapter is for sites that pair Rocket's static Pages with a Cloudflare Worker, such
as an app whose frontend is built by Rocket and whose `/api/*` is answered by the Worker.

- `rocket start` runs the Worker in the same process, on the same origin as the Rocket Pages.
- `rocket build` writes output that Workers Static Assets accepts.

The Worker and its bindings stay in the site's own Wrangler config. The adapter adds no Cloudflare
glue of its own.

## Configure the adapter

Install Wrangler next to Rocket. It is an optional peer dependency that only this adapter loads:

```bash
npm install --save-dev wrangler@^4.162.0
```

Add the adapter in `rocket-config.js`:

```js label="rocket-config.js"
import { cloudflare } from '@rocket/js/adapters/cloudflare.js';

/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['src/**/*.rocket.{md,js}'],
  adapter: cloudflare(),
};
```

The only option is the path of the Wrangler config, relative to the project root:
`cloudflare({ config: './wrangler.jsonc' })` is the default.

Point the Worker's static assets at Rocket's build output, and list the paths the Worker answers:

```json label="wrangler.jsonc"
{
  "name": "my-site",
  "main": "worker/index.js",
  "compatibility_date": "2026-11-01",
  "assets": {
    "directory": "./dist",
    "run_worker_first": ["/api/*"]
  }
}
```

## Local development

`rocket start` starts the Worker from the Wrangler config with Wrangler's `unstable_startWorker`:

- Requests to paths in `assets.run_worker_first` go to the Worker without a network hop. Method,
  headers, body, status and every `Set-Cookie` header pass through unchanged, and redirects are
  not followed.
- Every other path is served by Rocket.
- Saving a Worker file reloads the Worker without restarting Rocket. Local Durable Object and other
  storage stays in `.wrangler/state/`, as with `wrangler dev`.
- Local values come from `.dev.vars`, as with `wrangler dev`. The adapter passes no bindings of its
  own.
- `dist/` does not need to exist. Wrangler always wants an assets directory, so the adapter gives
  it an empty one under `.wrangler/`.
- Stopping `rocket start` stops the Worker.

While the Worker fails to start, its paths answer `503` at once with a plain-text body naming the
error. The full error is in the terminal. The next save that fixes it starts the Worker again. When
the Worker throws while handling a request, the request answers `500` with the stack.

Wrangler logs its own `Ready on http://localhost:<port>` line. Ignore that port: open the Rocket
dev server instead, which serves the Pages and the Worker together.

### Startup checks

`rocket start` stops with an error when:

- a `run_worker_first` entry is anything other than a plain `"/prefix/*"` pattern, such as
  `"/api/*"`. Negated patterns, `true`, and patterns with `*` elsewhere are not supported;
- a Rocket Page lies under a Worker path, so the Worker would shadow it;
- the installed Wrangler does not have the API this Rocket version uses.

## Build output

`rocket build` checks that `assets.directory` in the Wrangler config is Rocket's build output
directory, and writes `dist/.assetsignore` so Vite's `dist/.vite/` metadata is not uploaded.

Deploy with Wrangler as usual, for example `npx wrangler deploy` after `npx rocket build`.

The adapter serves static Pages only. Pages with `render: 'server'` and `urlLifecycle.redirects`
make `rocket build` fail with an error. Handle redirects in the Worker instead.

## Related docs

- [Deploy](/deploy) covers static and server-rendered deployment choices.
- [Netlify Adapter](/netlify-adapter) documents the adapter for server-rendered Pages on Netlify.
- [Configuration](/reference/configuration) documents the `adapter` config field.
