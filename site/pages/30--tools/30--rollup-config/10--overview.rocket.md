```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '30--tools/30--rollup-config/10--overview.rocket.md';
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

export const title = 'Rocket Rollup Config';
export const subTitle =
  'A ready to use and customizable rollup config for web sites, MPAs and SPAs';
```

# Overview

Rollup configuration to help you get started building modern web applications.
You write modern JavaScript using the latest browser features. Rollup will optimize your code for production and ensure it runs on all supported browsers.

## Features

- Set HTML or JavaScript as input and/or output
- Optimized for browsers which support modules
- Loads polyfills using feature detection
- Minifies JavaScript
- Minifies lit-html templates

## Setup

1. Install dependencies

   ```bash
   npm i -D rollup @rocket/building-rollup rollup @web/dev-server rimraf
   ```

2. Create a `rollup.config.js` file:

   ```js
   import { createSpaConfig } from '@rocket/building-rollup';
   // use `import { createBasicConfig }` to do regular JS to JS bundling
   // use `import { createMpaConfig }` to bundle multiple HTML files

   export default createSpaConfig({
     input: 'index.html',
     output: {
       dir: 'dist',
     },

     // use all options from https://rollupjs.org/guide/en/#configuration-files
   });
   ```

3. Add the following NPM scripts to your `package.json`:

   ```json
   {
     "scripts": {
       "build": "rimraf dist && rollup -c rollup.config.js",
       "start:build": "npm run build && web-dev-server --root-dir dist --app-index index.html --open"
     }
   }
   ```

## Customizations

Our config sets you up with good defaults for most projects. Additionally you can add more plugins and adjust predefined plugins or even remove them if needed.

We use the [plugins-manager](../10--plugins-manager/10--overview.rocket.md) for it.

### Customizing the Babel Config

You can define custom babel plugins to be loaded by adding a `.babelrc` or `babel.config.js` to your project. See [babeljs config](https://babeljs.io/docs/en/configuration) for more information.

For example to add support for class properties:

```json
{
  "plugins": ["@babel/plugin-proposal-class-properties"]
}
```

### Customizing Default Plugins

Our config creators install a number of Rollup plugins by default:

Basic, SPA and MPA plugins:

- [node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve#readme)
- [terser](https://github.com/TrySound/rollup-plugin-terser#readme)

SPA and MPA plugins:

- [babel](https://github.com/rollup/plugins/tree/master/packages/babel#readme)
- [html](https://modern-web.dev/docs/building/rollup-plugin-html/)
- [import-meta-assets](https://modern-web.dev/docs/building/rollup-plugin-import-meta-assets/)
- [polyfills-loader](https://modern-web.dev/docs/building/rollup-plugin-polyfills-loader/)
- [workbox](https://www.npmjs.com/package/rollup-plugin-workbox)

You can customize options for these plugins by using [adjustPluginOptions](../10--plugins-manager/10--overview.rocket.md#adjusting-plugin-options).

```js
import { createSpaConfig } from '@rocket/building-rollup';

export default createSpaConfig({
  setupPlugins: [adjustPluginOptions('node-resolve', { dedupe: ['lit-html'] })],
});
```
