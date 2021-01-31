# Configuration >> setupEleventyComputedConfig ||20

If you want to add data that depends on other data then you can do it via [Eleventy's computed data](https://www.11ty.dev/docs/data-computed/).

Rocket exposes it via `setupEleventyComputedConfig`.

## Set Your Own Data

Let's say you want to add a `Welcome to the contact page` everywhere. (A filter might be a better choice, but it's a good example of the concept.)

👉 `rocket.config.mjs` (or your theme config file)

```js
import { addPlugin } from 'plugins-manager';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupEleventyComputedConfig: [
    addPlugin({ name: 'greeting', plugin: data => `Welcome to the ${data.title} page.` }),
  ],
};

export default config;
```

{% raw %}
Now you can use {{ greeting }} everywhere.
{% endraw %}
And it will be correctly replaced with a Welcome and the page title.

## Default Available Configs

```js
[
  { name: 'titleMeta', plugin: titleMetaPlugin },
  { name: 'title', plugin: titlePlugin },
  { name: 'eleventyNavigation', plugin: eleventyNavigationPlugin },
  { name: 'section', plugin: sectionPlugin },
  { name: 'socialMediaImage', plugin: socialMediaImagePlugin },
];
```
