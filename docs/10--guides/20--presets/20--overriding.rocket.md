```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--guides/20--presets/20--overriding.rocket.md';
import { pageTree, setupUnifiedPlugins, footerMenu, layout } from '../../recursive.data.js';
export { pageTree, setupUnifiedPlugins, footerMenu, layout };
/* END - Rocket auto generated - do not touch */
```

# Overriding

All loaded presets will be combined but you can override each file.

Take a look at `docs/_merged_includes` and override what you want to override by placing the same filename into `_includes`.

For example, to override the css files loaded in the `<head>`,

```bash
cp docs/_merged_includes/_joiningBlocks/head/40-stylesheets.njk \
   docs/_includes/_joiningBlocks/head/40-stylesheets.njk
```

then edit the file to suit your needs.

Also works for `_assets`, `_data` ...

<inline-notification type="warning">

If you don't [add `.eleventyignore`](/guides/first-pages/getting-started/#setup), you may receive error messages when running `rocket build`.

</inline-notification>

```js script
import '@rocket/launch/inline-notification/inline-notification.js';
```
