```js server
export const config = {
  path: '/netlify-adapter',
  metadata: {
    title: 'Netlify Adapter',
    description: 'Deploy Rocket server-rendered Pages through the Netlify adapter.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Adapter tip',
          description:
            'Mark only request-time Pages for server rendering; static Pages still build into dist/ and deploy alongside adapter routes.',
        },
      },
    },
  },
  menu: {
    linkText: 'Netlify Adapter',
    iconName: 'cloud-check',
    parent: '/guides',
    order: 35,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Netlify Adapter

The Netlify adapter deploys Rocket Pages that use `config.render: 'server'`. Static Pages still
build to `dist/`; server-rendered Pages are bundled into a Netlify Function.

Use this adapter when a Rocket site has request-time JavaScript Pages, parameterized Pages, or
server-rendered Markdown Pages and the production host is Netlify.

## Configure the adapter

Add the adapter in `rocket-config.js`:

```js label="rocket-config.js"
import { netlify } from '@rocket/js/adapters/netlify.js';

/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['src/pages/**/*.rocket.{md,js}'],
  adapter: netlify(),
};
```

Static-only sites do not need this. Rocket only asks the adapter to write output when the build has
server-rendered Pages.

## Mark request-time Pages

Use `render: 'server'` for Pages that need request-time behavior:

```js label="Server-rendered Page config"
export const config = {
  path: '/api/components/:componentName.json',
  render: 'server',
  menu: false,
};
```

Parameterized JavaScript Pages need `render: 'server'` today because Rocket does not yet have a
static params enumeration API.

## Build output

Run the production build:

```bash
npm run build
```

Rocket writes static files to `dist/`. When server-rendered Pages exist, the Netlify adapter also
writes:

```text
.netlify/v1/functions/rocket-ssr.mjs
```

When `urlLifecycle.redirects` is configured, the Netlify adapter writes native redirect rules to:

```text
dist/_redirects
```

If server-rendered Pages use client-loaded or hydrated Registered Components, the adapter also
emits browser assets under:

```text
dist/assets/rocket-live/
```

Server-rendered Pages can use `rocket-icon` with the same rendering behavior as static Pages. The
generated function receives the project Icon Library Configuration, preserves Rocket's Bootstrap
Icon source files for Rocket-owned layouts, and includes configured package-backed and project-local
Icon Library source globs in the Netlify function `includedFiles` list.

When a request-time Page emits an Icon Manifest, generated asset URLs keep the same deterministic
shape as static output:

```text
/_rocket/icons/<library>/<name>.<hash>.svg
```

Those icon asset URLs, plus `/_rocket/rocket-icon.js` and `/_rocket/RocketIcon.js`, are routed
through the generated function so deferred icons and browser-created Page-known icons can load after
deployment.

Standalone Demo URLs for server-rendered Markdown Pages are routed through the same function.

## URL Lifecycle Redirects

Rocket maps each configured Redirect to one Netlify `_redirects` rule:

```text
/old-guide /guides/current 301
/external-docs https://docs.example.com/ 302
```

Internal targets, external `http:` and `https:` targets, and configured Redirect statuses are
preserved. Redirects without an explicit status use Rocket's default `308`.

Netlify adapter builds use native `_redirects` output instead of Rocket's adapterless HTML fallback
files, so Redirect source paths do not create `dist/<source>/index.html` fallback documents.

## Netlify project settings

Use these settings for a typical project:

| Setting           | Value           |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node.js version   | `22` or newer   |

Deploy through Netlify Git integration or Netlify CLI so the build command runs in the Netlify
environment and the generated function is included. Uploading only `dist/` publishes static files
but cannot serve server-rendered Pages.

## Request context

For JavaScript Pages, the Netlify request context is passed through as `context.adapterContext`:

```js label="Netlify adapter context"
export default async (_request, { adapterContext }) => {
  return Response.json({
    platform: adapterContext?.site?.name,
  });
};
```

Rocket does not interpret platform-specific fields. Keep those details inside the JavaScript Page
that needs them.

## Static and server routes together

The adapter keeps static output and request-time output separate:

- static Markdown Pages and concrete static JavaScript Pages are files in `dist/`
- Pages with `render: 'server'` run through the generated Netlify Function
- static files remain preferred for paths that have static output
- Standalone Demo URLs follow their parent Markdown Page's render mode

Configured Page paths must still be unique. If a generated Standalone Demo URL collides with a
configured Page, the build fails.

## Verification

After `npm run build`, check:

```bash
test -d dist
test -f .netlify/v1/functions/rocket-ssr.mjs
test -f dist/_redirects # when urlLifecycle.redirects is configured
```

Then verify the important route shapes:

- a static Page from `dist/`
- a configured Redirect from `dist/_redirects`
- a server-rendered JavaScript Page
- a parameterized route
- any Standalone Demo URL from a server-rendered Markdown Page
- any `rocket-icon` asset URL emitted in an Icon Manifest for a server-rendered Page
- any hydrated or client-loaded Registered Component used by a server-rendered Page

## Common fixes

- Build fails with server-rendered Pages and no adapter: add `adapter: netlify()` to
  `rocket-config.js`.
- Server route works locally but not after manual upload: deploy through Netlify Git integration or
  Netlify CLI instead of uploading only `dist/`.
- Component hydrates locally but not on Netlify: check that `dist/assets/rocket-live/` exists after
  build and that the browser can request those files.
- Deferred `rocket-icon` assets are 404s: make sure project-local Icon Library paths are deployable
  files inside the project, such as `iconsFromPath('./src/icons/*.svg')`, not absolute paths to a
  machine-local directory outside the repository.
- A server-rendered route fails while rendering an icon: check the function logs for the missing
  Icon Reference or invalid Icon Loading Region policy.
- Route returns a 500: check Netlify Function logs; Rocket logs Page Runtime errors before
  returning an internal server error.

## Related docs

- [Deploy](/deploy) covers static and server-rendered deployment choices.
- [Request-time JavaScript Pages](/request-time-javascript-pages) shows request-time Page
  patterns.
- [Configuration](/reference/configuration) documents the `adapter` config field.
