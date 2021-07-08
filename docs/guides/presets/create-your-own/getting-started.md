# Presets >> Create your Own >> Getting Started || 10

A preset is a setup function and a folder including `_assets`, `_data` and `_includes` (all optional).

To play around with a preset you can create a folder `fire-theme`.

You then create the setup function for it with only one property called `path` which will allow Rocket to properly resolve it.

## Create a Preset Config File

👉 `fire-theme/fireTheme.js`

```js copy
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

```css copy
body {
  background: hotpink;
}
```

Once you have that you can add it to your Rocket config.

NOTE: The order of presets is important, as for example in this case we take everything from `rocketLaunch` but later override via `fireTheme`.

👉 `rocket.config.js`

<!-- prettier-ignore-start -->
```js copy
import { rocketLaunch } from '@rocket/launch';
import { fireTheme } from 'path/to/fire-theme/fireTheme.js';

/** @type {import('@rocket/cli').RocketCliOptions} */
export default ({
  presets: [rocketLaunch(), fireTheme()],
});
```
<!-- prettier-ignore-end -->
