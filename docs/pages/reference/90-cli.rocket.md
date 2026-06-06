```js server
export const config = {
  path: '/reference/cli',
  metadata: {
    title: 'CLI',
    description: 'Run Rocket development and build commands from npm scripts or npx.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'CLI tip',
          description:
            'Use project npm scripts for repeatable start and build commands; npx is best for quick checks or scaffolding.',
        },
      },
    },
  },
  menu: {
    iconName: 'terminal',
    order: 90,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# CLI

Rocket ships a small CLI for local development and production builds. Use the project-local binary
through npm scripts or `npx`.

## Commands

### `rocket init`

Creates a compact Atlas docs starter in the current npm project:

```bash
npx rocket init
```

The initializer creates these files when they do not already exist:

- `rocket-config.js`
- `docs/pages/sharedData.js`
- `docs/pages/index.rocket.md`
- `docs/pages/docs.rocket.md`
- `docs/pages/javascript-demo.rocket.md`
- `docs/pages/request-demo.rocket.md`
- `docs/pages/site-status.rocket.js`
- `.agents/skills/rocket/SKILL.md`

The starter uses Atlas layouts, exports the matching Atlas component maps, includes navigation
icons through `menu.iconName`, and includes both JavaScript Demo and Request Demo examples.

It also updates `package.json` when possible:

- adds `"type": "module"` when `type` is missing
- adds `start` and `build` scripts when those names are available
- adds `rocket:start` and `rocket:build` when existing project scripts already use `start` or
  `build`

`rocket init` does not overwrite existing files, install dependencies, add `@rocket/js` to
`package.json`, or run a build. Existing CommonJS projects are rejected before any files are
written.

### `rocket start`

Starts the development server:

```bash
npx rocket start
```

The dev server opens the browser, listens on port `8888` by default, and can be restarted with
`Ctrl+R` in the terminal.

Useful flags:

```bash
npx rocket start --port 3000
npx rocket start --no-open
npx rocket start --no-watch
```

`--no-open` keeps the browser closed. `--no-watch` disables Rocket's automatic file watching and
reloads while keeping manual `Ctrl+R` restarts available.

### `rocket build`

Runs a production build:

```bash
npx rocket build
```

Static Pages are rendered into `dist/`. If an adapter is configured, Rocket also gives the adapter
the discovered static and server-rendered Pages so it can write deployment-specific output.

## Options

### `-c, --config-file <path>`

Load a config file other than `rocket-config.js`:

```bash
npx rocket -c ./config/rocket-config.js start
npx rocket -c ./config/rocket-config.js build
```

### `build -o, --output-dir <path>`

Write static build output to a directory other than `dist/`:

```bash
npx rocket build --output-dir ./site-dist
```

Do not use `public/` as the build output directory. Rocket reserves project-root `public/` for
Public Assets.

## package.json scripts

For repeatable project commands, add scripts:

```json
{
  "scripts": {
    "start": "rocket start",
    "build": "rocket build"
  }
}
```

Then run:

```bash
npm start
npm run build
```

See [Configuration](/reference/configuration) for the `rocket-config.js` file these commands load.
`rocket init` adds these scripts automatically when the names are not already used.

## Requirements

Rocket requires Node.js 22 or newer.

For the current command list, run:

```bash
npx rocket --help
```
