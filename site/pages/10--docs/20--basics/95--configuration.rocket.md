```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/95--configuration.rocket.md';
// prettier-ignore
import { html, layout, setupUnifiedPlugins, components, openGraphLayout } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('inline-notification', await import('@rocket/components/inline-notification.js').then(m => m.InlineNotification));
  // prettier-ignore
  customElements.define('rocket-main-docs', await import('@rocket/components/main-docs.js').then(m => m.RocketMainDocs));
  // prettier-ignore
  customElements.define('rocket-content-area', await import('@rocket/components/content-area.js').then(m => m.RocketContentArea));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */
```

# Configuration

It loads the first config it finds in the following order:

1. `config/rocket.config.js`
2. `config/rocket.config.mjs`
3. `config/rocket.config.js`
4. `rocket.config.mjs`

It typically looks something like this

```js
import { rocketLaunch } from '@rocket/launch';
import { absoluteBaseUrlNetlify } from '@rocket/netlify';

export default /** @type {import('@rocket/cli').RocketCliOptions} */ ({
  presets: [rocketLaunch()],
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),
});
```

<inline-notification>

The configuration should only be used to define global settings that can NOT be overridden within a page.
For settings that may be overridden within a page, use the [**data cascade**](./30--data-cascade.rocket.md) feature.

</inline-notification>

Rocket is primarily built around plugins for each of its systems.

Given that rocket comes with a list of default plugins and that presets can add plugins it's very important to not "just" set a new "plugins" property.

To enable customization we make use of the [plugins-manager](../../30--tools//10--plugins-manager/10--overview.rocket.md).

New plugins can be added and all default plugins can be adjusted or even removed by using the following functions.

```js
/** @type {import('rocket/cli').RocketCliConfig} */
export default {
  // add a rollup plugin to the web dev server (will be wrapped with @web/dev-server-rollup) AND the rollup build (e.g. enable json importing)
  setupDevServerAndBuildPlugins: [],

  // add a plugin to the web dev server (will not be wrapped) (e.g. esbuild for TypeScript)
  setupDevServerPlugins: [],

  // add a middleware to the web dev server (e.g. api proxy)
  setupDevServerMiddleware: [],

  // add a plugin to the rollup build (e.g. optimization steps)
  setupBuildPlugins: [],

  // add a plugin to the cli (e.g. a new command like "rocket my-command")
  setupCliPlugins: [],
};
```

## Adjusting the input/output directories

Rocket comes with sensible defaults for the input and output directories you can however override those if needed.

You can either set a URL or an absolute path.

<inline-notification>

Using `new URL('./path/to/dir', import.meta.url)` makes sure that the path is relative to the current file.

</inline-notification>

Here is an example where we use a deeper folder for the pages and output to a root `dist` folder.

👉 `config/rocket.config.js`

```js
export default {
  inputDir: new URL('../projectX/site/pages', import.meta.url),
  outputDir: new URL('../dist', import.meta.url),
};
```

## Adding an API proxy

If we want to access an API client side we need to access it via the same domain.
However in most cases the API server is running on a different server/url/domain.

Doing cross domain/port request is not allowed on the client side.
To still access it we can use a proxy.

Let's say we have an API server running on port 9000 and the Rocket Dev Server is run on port 8000.

```js
import proxy from 'koa-proxy';
import { addPlugin } from 'plugins-manager';

export default /** @type {import('rocket/cli').RocketCliConfig} */ ({
  setupDevServerMiddleware: [
    addPlugin(proxy, {
      host: 'http://localhost:9000/',
      match: /^\/api\//,
    }),
  ],
});
```

We can now do ajax requests to `http://localhost:8000/api/message` and it will be proxied to `http://localhost:9000/api/message`.

## Adding Rollup Plugins

For some projects you might want to enable non-standard behaviors like importing JSON files as JavaScript.

```js
import data from './data.json';
```

You can accomplish this with Rollup and dev server plugins. Make sure to add both the dev-server plugin as well as the Rollup plugin, so that the behavior is the same during development as it is in the production build.

For these cases you can use `setupDevServerAndBuildPlugins`, which will automatically add the plugin for you to both Rollup and dev-server:

```js
import json from '@rollup/plugin-json';
import { addPlugin } from 'plugins-manager';

/** @type {import('@rocket/cli').RocketCliOptions} */
export default {
  setupDevServerAndBuildPlugins: [addPlugin(json, { my: 'settings' }, { location: 'top' })],
};
```

This will add the Rollup plugin `json` with the id `json` at the top of the plugin list of Rollup and the dev server. It needs to be at the top so further plugins down the line can work with JSON imports.
For the Dev Server the plugins are automatically wrapped by `@web/dev-server-rollup`. Note that [not all Rollup plugins](https://modern-web.dev/docs/dev-server/plugins/rollup/#compatibility-with-rollup-plugins) will work with the dev-server.

## Modifying Options of Plugins

All plugins which are either default or are added via a preset can still be adjusted by using `adjustPluginOptions`.

```js
import { adjustPluginOptions } from 'plugins-manager';

/** @type {import('@rocket/cli').RocketCliOptions} */
export default {
  setupDevServerAndBuildPlugins: [adjustPluginOptions(json, { my: 'overwrite settings' })],
};
```

## Advanced

Sometimes you need even more control over specific settings.

### DevServerOptions (@web/dev-server)

```js
export default /** @type {import('rocket/cli').RocketCliOptions} */ ({
  adjustDevServerOptions: options => ({
    ...options,
    hostname: 'my-hostname',
  }),
});
```

### BuildOptions (rollup)

For example if you wanna add an `acorn` plugin to rollup

```js
import { importAssertions } from 'acorn-import-assertions';

export default /** @type {import('rocket/cli').RocketCliOptions} */ ({
  adjustBuildOptions: options => ({
    ...options,
    acornInjectPlugins: [importAssertions],
  }),
});
```
