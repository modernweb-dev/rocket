# Configuration >> Computed Config || 20

If you want to add data that depends on other data then you can do it via [Eleventy's computed data](https://www.11ty.dev/docs/data-computed/).

Rocket exposes it via `setupEleventyComputedConfig`.

## Set Your Own Data

Let's say you want to add a `Welcome to the contact page` everywhere. (A filter might be a better choice, but it's a good example of the concept.)

👉 `rocket.config.js` (or your theme config file)

<!-- prettier-ignore-start -->
```js copy
import { addPlugin } from 'plugins-manager';

/** @type {import('@rocket/cli').RocketCliOptions} */
export default ({
  setupEleventyComputedConfig: [
    addPlugin({ name: 'greeting', plugin: data => `Welcome to the ${data.title} page.` }),
  ],
});
```
<!-- prettier-ignore-end -->

Now you can use {% raw %}{{ greeting }}{% endraw %} everywhere,
and it will be correctly replaced with a Welcome and the page title.

## Default Available Configs

```js
[
  { name: 'titleMeta', plugin: titleMetaPlugin },
  { name: 'title', plugin: titlePlugin },
  { name: 'eleventyNavigation', plugin: eleventyNavigationPlugin },
  { name: 'section', plugin: sectionPlugin },
  { name: 'socialMediaImage', plugin: socialMediaImagePlugin },
  { name: 'templateBlocks', plugin: templateBlocksPlugin, options: rocketConfig },
];
```
