```js server
export const config = {
  path: '/advanced/dev-server',
  metadata: {
    title: 'Dev Server',
    description:
      'Use the Rocket dev server to preview Pages, components, assets, and request-time behavior.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Dev server tip',
          description:
            'Restart the dev server after changing config or adding Pages under new directories; watched content, local imports, and component files update without a full build.',
        },
      },
    },
  },
  menu: {
    iconName: 'hdd-network',
    order: 30,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Dev Server

The Rocket dev server renders Pages locally with `@web/dev-server`. It is the fastest way to check
Page discovery, Markdown rendering, JavaScript Pages, component loading, and asset references.

## Start

```bash
npx rocket start
```

With the default npm script from the quick start, this is equivalent to:

```bash
npm start
```

The server opens the browser and listens on port `8888` by default.

Use flags when you need a different startup shape:

```bash
npx rocket start --port 3000
npx rocket start --no-open
npx rocket start --no-watch
```

`--no-open` leaves the browser closed. `--no-watch` disables automatic reload watchers; use
`Ctrl+R` for manual restarts when you want to reload after a change.

## Restart

The `rocket start` wrapper keeps a server process running and listens for keyboard input:

- Press `Ctrl+R` in the terminal to restart the dev server.
- Press `Ctrl+C` to stop it.

Restart after config changes, new Page directories that are not watched yet, or errors that leave
the server in a bad state.

## Watch behavior

On startup, Rocket scans `includeGlobs`, builds the Page registry, and watches directories that
contain discovered Pages or local modules resolved by Page imports. As additional local imports are
resolved while serving Pages, Rocket adds their directories to the watcher.

When a watched file changes, Rocket:

1. clears Markdown import resolution state,
2. rescans Pages,
3. sends a browser reload through the dev server websocket.

If a new Page lives in a directory that was not watched yet, restart with `Ctrl+R`.

## Config file

Rocket reads `rocket-config.js` from the current working directory:

```js label="rocket-config.js"
/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/**/*.rocket.{md,js}'],
};
```

Use `-c` to load a different config file:

```bash
npx rocket -c ./config/rocket-config.js start
```

## Dev server config

Use `adjustDevServerConfig` to modify the default `@web/dev-server` config:

```js label="rocket-config.js"
export default {
  includeGlobs: ['docs/**/*.rocket.{md,js}'],
  adjustDevServerConfig: config => ({
    ...config,
    port: 3000,
  }),
};
```

The default config includes:

- `port: 8888`
- `open: true`
- `watch: true`
- browser export conditions for package resolution
- Rocket's Page rendering plugin

For all config fields, see [Configuration](/reference/configuration).

## Non-page requests

The dev server serves Public Assets from `public/` at their root-relative URLs. A file at
`public/favicon.svg` is available as `/favicon.svg` locally and after `rocket build`.

The dev server also distinguishes document requests from asset requests. For non-page requests,
Rocket tries to resolve the requested path relative to the current Page's source file when a
matching file exists.

For build-safe asset URLs, prefer the [`resolve` function](/reference/assets) in Page server code or
layout code. For stable root-relative files such as favicons, verification files, and downloads,
use [Public Assets](/reference/assets).
