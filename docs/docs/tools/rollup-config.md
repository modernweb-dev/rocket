# Tools >> Rollup Config ||20

Rollup configuration to help you get started building modern web applications.
You write modern JavaScript using the latest browser features. Rollup will optimize your code for production and ensure it runs on all supported browsers.

## Features

- Set HTML or JavaScript as input and/or output
- Optimized for browsers which support modules
- Loads polyfills using feature detection
- Generates a service worker
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

We use the [plugins-manager](./plugins-manager.md) for it.

### Customizing the babel config

You can define custom babel plugins to be loaded by adding a `.babelrc` or `babel.config.js` to your project. See [babeljs config](https://babeljs.io/docs/en/configuration) for more information.

For example to add support for class properties:

```json
{
  "plugins": ["@babel/plugin-proposal-class-properties"]
}
```

### Customizing default plugins

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

You can customize options for these plugins by using [adjustPluginOptions](./plugins-manager.md#adjusting-plugin-options).

```js
import { createSpaConfig } from '@rocket/building-rollup';

export default createSpaConfig({
  setupPlugins: [adjustPluginOptions('node-resolve', { dedupe: ['lit-html'] })],
});
```
