# Presets >> Create your Own >> Publishing || 100

If you would like to publish a preset to use it on multiple websites or share it with your friends you can do like so.

1. Pick a name for the package
   - use the convention `rocket-preset-${name}`
   - for this example we use `rocket-preset-fire-theme`.
2. Create a new folder `fire-theme`
3. Create a folder `fire-theme/preset` copy `fireTheme.js` from [above](../getting-started/) into `preset/fireTheme.js`
4. Add a 👉 `package.json`

   ```json copy
   {
     "name": "rocket-preset-fire-theme",
     "version": "0.3.0",
     "description": "Fire Theme for Rocket",
     "license": "MIT",
     "type": "module",
     "exports": {
       ".": "./index.js",
       "./preset/": "./preset/"
     },
     "files": ["*.js", "preset"],
     "keywords": ["rocket", "preset"]
   }
   ```

5. Add a 👉 `index.js`

   ```js copy
   export { fireTheme } from './preset/fireTheme.js';
   ```

<!-- prettier-ignore-start -->
6. Add a 👉 `README.md`

   ~~~markdown copy
   # FireTheme

   This is a theme/preset for [Rocket](https://rocket.modern-web.dev/).

   ## Installation

   ```
   npm i -D fire-theme
   ```

   Add it to your 👉 `rocket.config.js`

   ```js
   import { fireTheme } from 'fire-theme';

   /** @type {import('@rocket/cli').RocketCliOptions} */
   export default ({
     presets: [rocketLaunch(), fireTheme()],
   });
   ```
   ~~~

<!-- prettier-ignore-end -->
