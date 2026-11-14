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

The Cloudflare adapter deploys **static Rocket Pages together with a Cloudflare Worker you already
have**: Rocket builds the frontend, and the Worker answers paths such as `/api/*`.

- `rocket start` runs the Worker on the same origin as the Rocket Pages: same origin, one port.
- `rocket build` writes output that Workers Static Assets accepts, including `_redirects` for
  URL Lifecycle Redirects.

**Server-rendered Pages are not supported yet.** Pages with `render: 'server'` make `rocket build`
fail. To render Pages at request time, use the [Netlify Adapter](/netlify-adapter) for now.

The Worker and its bindings stay in the site's own Wrangler config, and the adapter generates no
Worker code.

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

- Requests to paths in `assets.run_worker_first` go to the Worker, on the same origin and port as
  the Pages. Method, headers, body, status and every `Set-Cookie` header pass through unchanged,
  and redirects are not followed.
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

## Development and production differences

`rocket start` matches production for the paths in `run_worker_first`. Everything else is served
by Rocket in dev and by Cloudflare in production, which differs in these ways:

| Behavior                           | `rocket start`                   | Cloudflare                                                 |
| ---------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| A path that matches no Page        | Rocket answers `404`             | The Worker runs, unless `assets.not_found_handling` is set |
| `env.ASSETS.fetch()` in the Worker | `404`: the Worker gets no assets | Serves the built Pages                                     |
| Redirects                          | Rocket's dev server applies them | Cloudflare applies `dist/_redirects`                       |
| WebSockets on Worker paths         | Not supported                    | Supported                                                  |

`rocket start` also runs the Worker without the inspector, so Worker breakpoints are not available.

To check any of these locally, or to debug the Worker, run `npx rocket build` and then
`npx wrangler dev`, which serves the built output the way Cloudflare does.

## Checks

`rocket start` and `rocket build` stop with an error when:

- a `run_worker_first` entry is anything other than a plain `"/prefix/*"` pattern, such as
  `"/api/*"`. Negated patterns, `true`, and patterns with `*` elsewhere are not supported;
- a Rocket Page or a Redirect source lies under a Worker path, so the Worker would shadow it;
- the installed Wrangler does not have the API this Rocket version uses.

## Build output

`rocket build` checks that `assets.directory` in the Wrangler config is Rocket's build output
directory, and writes:

```text
dist/.assetsignore   keeps Vite's dist/.vite/ metadata out of the upload
dist/_redirects      when urlLifecycle.redirects is configured
```

Deploy with Wrangler as usual, for example `npx wrangler deploy` after `npx rocket build`.

## URL Lifecycle Redirects

Rocket writes each configured Redirect as one `_redirects` rule, in the same format as the
[Netlify Adapter](/netlify-adapter):

```text
/old-guide /guides/current 301
/external-docs https://docs.example.com/ 302
```

Internal and external `http:` or `https:` targets and configured statuses are kept. Redirects
without a status use Rocket's default `308`. Wrangler reads `_redirects` itself and does not upload
it as an asset, and Rocket writes no HTML fallback files for Redirect sources.

Cloudflare silently skips `_redirects` rules it cannot apply, so `rocket build` fails instead when:

- more than 2000 Redirects are configured;
- a Redirect source contains `*` or `:name`, which Cloudflare reads as a pattern. Rocket Redirects
  match their source exactly;
- a rule is longer than 2000 characters.

## Related docs

- [Deploy](/deploy) covers static and server-rendered deployment choices.
- [Netlify Adapter](/netlify-adapter) documents the adapter for server-rendered Pages on Netlify.
- [Configuration](/reference/configuration) documents the `adapter` config field.
