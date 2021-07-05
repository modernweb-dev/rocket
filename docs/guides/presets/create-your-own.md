# Presets >> Create your own || 90

A preset is a setup function and a folder including `_assets`, `_data` and `_includes` (all optional).

To play around with a preset you can create a folder `fire-theme`.

You then create the setup function for it with only one property called `path` which will allow Rocket to properly resolve it.

## Create a Preset Config File

👉 `fire-theme/fireTheme.js`

```js
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function fireTheme() {
  return {
    path: path.resolve(__dirname),
  };
}
```

Once you have that you can start filling in content you need.

For example we could override the full `layout.css` by adding it like so

👉 `fire-theme/layout.css`

```css
body {
  background: hotpink;
}
```

Once you have that you can add it to your Rocket config.

NOTE: The order of presets is important, as for example in this case we take everything from `rocketLaunch` but later override via `fireTheme`.

👉 `rocket-config.js`

```js
import { rocketLaunch } from '@rocket/launch';
import { fireTheme } from 'path/to/fire-theme/fireTheme.js';

export default {
  presets: [rocketLaunch(), fireTheme()],
};
```

## Publish a Preset

If you would like to publish a preset to use it on multiple websites or share it with your friends you can do like so.

1. Pick a name for the package => for this example we take `fire-theme`.
2. Create a new folder `fire-theme`
3. Create a folder `fire-theme/preset` copy `fireTheme.js` from [above](#create-a-preset-config-file) into `preset/fireTheme.js`
4. Add a 👉 `package.json`

   ```json
   {
     "name": "fire-theme",
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

   ```js
   export { fireTheme } from './preset/fireTheme.js';
   ```

6. Add a 👉 `README.md`

   ````
   # FireTheme

   This is a theme/preset for [Rocket](https://rocket.modern-web.dev/).

   ## Installation

   ```
   npm i -D fire-theme
   ```

   Add it to your 👉 `rocket.config.js`

   ```js
   import { fireTheme } from 'fire-theme';

   export default {
     presets: [fireTheme()],
   };
   ```
   ````
