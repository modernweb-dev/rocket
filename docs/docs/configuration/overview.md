# Configuration >> Overview || 10

The configuration file is `rocket.config.js` or `rocket.config.mjs`.

The config files consist of the following parts:

```js
import { rocketLaunch } from '@rocket/launch';

export default {
  presets: [rocketLaunch()],
  emptyOutputDir: true,
  pathPrefix: 'subfolder-only-for-build',
};
```

Rocket is primarily build around plugins for each of its systems.

New plugins can be added and all default plugins can be adjusted or even removed by using the following functions.

```js
export default {
  // add remark/unified plugin to the Markdown processing (e.g. enable special code blocks)
  setupUnifiedPlugins: [],

  // add a rollup plugins to the web dev server (will be wrapped with @web/dev-server-rollup) AND the rollup build (e.g. enable json importing)
  setupDevAndBuildPlugins: [],

  // add a plugin to the web dev server (will not be wrapped) (e.g. esbuild for TypeScript)
  setupDevPlugins: [],

  // add a plugin to the rollup build (e.g. optimization steps)
  setupBuildPlugins: [],

  // add a plugin to Eleventy (e.g. a filter packs)
  setupEleventyPlugins: [],

  // add a computedConfig to Eleventy (e.g. site wide default variables like socialMediaImage)
  setupEleventyComputedConfig: [],

  // add a plugin to the cli (e.g. a new command like "rocket my-command")
  setupCliPlugins: [],
};
```

## Adding Rollup Plugins

For some projects you might want to enable non-standard behaviors like importing JSON files as JavaScript.

```js
import data from './data.json';
```

You can accomplish this with Rollup and dev server plugins. Make sure to add both the dev-server plugin as well as the Rollup plugin, so that the behaviors is the same during development as it is in the production build.

For these cases you can use `setupDevAndBuildPlugins`, which will automatically add the plugin for you to both Rollup and dev-server:

```js
import json from '@rollup/plugin-json';
import { addPlugin } from 'plugins-manager';

/** @type {Partial<import("@rocket/cli").RocketCliOptions>} */
const config = {
  setupDevAndBuildPlugins: [
    addPlugin({ name: 'json', plugin: json, location: 'top', options: { my: 'settings' } }),
  ],
};

export default config;
```

This will add the Rollup plugin `json` with the id `json` at the top of the plugin list of Rollup and the dev server. It needs to be at the top so further plugins down the line can work with JSON imports.
For the Dev Server the plugins are automatically wrapped by `@web/dev-server-rollup`. Note that [not all Rollup plugins](https://modern-web.dev/docs/dev-server/plugins/rollup/#compatibility-with-rollup-plugins) will work with the dev-server.

## Modifying Options of Plugins

All plugins which are either default or are added via a preset can still be adjusted by using `adjustPluginOptions`.

```js
import { adjustPluginOptions } from 'plugins-manager';

/** @type {Partial<import("@rocket/cli").RocketCliOptions>} */
const config = {
  setupDevAndBuildPlugins: [adjustPluginOptions('json', { my: 'overwrite settings' })],
};

export default config;
```

## Lifecycle

You can hook into the rocket lifecycle by specifying a function for `before11ty`. This function runs before 11ty calls it's write method. If it is an async function, Rocket will await it's promise.

```js
export default {
  async before11ty() {
    await copyDataFiles();
  },
};
```
