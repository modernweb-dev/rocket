# Presets >> Overriding ||20

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
