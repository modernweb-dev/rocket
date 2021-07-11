# Configuration >> Getting Started ||10

The main config file is `rocket.config.js` or `rocket.config.mjs`.

It typically looks something like this

```js
import { rocketLaunch } from '@rocket/launch';
import { rocketBlog } from '@rocket/blog';
import { rocketSearch } from '@rocket/search';
import { absoluteBaseUrlNetlify } from '@rocket/core/helpers';

export default /** @type {Partial<import('@rocket/cli').RocketCliOptions>} */ ({
  presets: [rocketLaunch(), rocketBlog(), rocketSearch()],
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),
});
```

The Plugins Manager helps you register and execute your plugins across the various Rocket components - Rollup, Web Dev Server, Eleventy, and Markdown. It replaces the specific registration/execution call in a given plugin system by an intent to use that plugin.

## Adding Remark/Unified Plugins

If you want to add a plugin to the Markdown processing you can use `setupUnifiedPlugins`.

<!-- prettier-ignore-start -->
```js
import emoji from 'remark-emoji';
import { addPlugin } from 'plugins-manager';

/** @type {Partial<import('@rocket/cli').RocketCliOptions>} */
export default ({
  setupUnifiedPlugins: [addPlugin({ location: 'markdown', name: 'emoji', plugin: emoji })],
});
```
<!-- prettier-ignore-end -->

For plugins that should handle the Markdown <abbr title="Abstract Syntax Tree">AST</abbr> you should use `addPlugin({ location: 'markdown', name: 'my-plugin', plugin: MyPlugin})`. <br>
While for the rehype AST you should use `addPlugin({ location: 'remark2rehype', name: 'my-plugin', plugin: MyPlugin})`.
