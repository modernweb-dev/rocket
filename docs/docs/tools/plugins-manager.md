# Tools >> Plugins Manager ||10

The Plugins Manager replaces the specific registration/execution (with options) in a given plugin system by an intend to use a plugin (with these options).
This allows your users to adjust the options before actually applying the plugins.

## Problem

Many plugin systems require you to either execute a plugin function like in `rollup`.

```js
import json from '@rollup/plugin-json';
export default {
  plugins: [json({ preferConst: true })],
};
```

or add it in a special way like in `eleventy`

```js
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginSyntaxHighlight, { templateFormats: ['md'] });
};
```

or `unified/remark`.

```js
var unified = require('unified');
var markdown = require('remark-parse');
var toc = require('remark-toc');

var processor = unified().use(markdown).use(toc, { maxDepth: 2 });
// ...
```

## Problem statement

> Executing or adding a plugin in a special way is a one time process. You can not transparently later change the options of the given plugin.

This means if you wish to define default plugins and allow your user to override all of the settings it's "impossible".

## Solution

The plugins manager let's you orchestrate a set of "meta plugins" which are defined by

- name
- plugin
- options

```js
import beep from '@rollup/plugin-beep';
import url from '@rollup/plugin-url';

let metaPlugins = [
  { name: 'beep', plugin: beep },
  { name: 'url', plugin: url, options: { limit: 10000 } },
];
```

This array can be modified by adding/removing or adjusting options.

```js
// raw add
metaPlugins.push({
  // another plugin
});

// raw adjust
metaPlugins[1].options.limit = 20000;
```

And then you can convert it into the specific format that can be assigned to your system in question.

```js
// execute plugins for rollup
const plugins = metaPlugins.map(pluginObj => {
  if (pluginObj.options) {
    return pluginObj.plugin(pluginObj.options);
  } else {
    return pluginObj.plugin();
  }
});

// rollup.config.js
export default {
  plugins,
};
```

### Adding Helpers

Doing array manipulations is kinda error-prone so we offer encourage to use an array of setup function. Where as each setup function can either add a new plugin (with a unique name) or adjust an already existing plugin.

```js
import { addPlugin, adjustPluginOptions } from 'plugins-manager';

const systemSetupFunctions = [
  addPlugin({ name: 'first', plugin: first }),
  addPlugin({ name: 'second', plugin: second }),
];
const userSetupFunctions = [adjustPluginOptions('first', { my: 'options' })];
```

Arrays of functions can by merged like so

```js
const finalSetupFunctions = [...systemSetupFunctions, ...userSetupFunctions];
```

and then converted to the final output.

```js
import { metaPluginsToRollupPlugins } from 'plugins-manager';

const plugins = metaPluginsToRollupPlugins(finalSetupFunctions, metaPlugins);
```

## Adding a Plugin

This makes sure that

- the name is unique
- you can add at at `top`, `bottom` and `after/before` a given other plugin

By default it adds at the bottom.

```js
import json from '@rollup/plugin-json';
import { addPlugin } from 'plugins-manager';

const userSetupFunctions = [
  addPlugin({ name: 'json', plugin: json, options: { preferConst: true } }),
];
```

Example usage:

```js
addPlugin({ name: 'json', plugin: json }); // Add at the bottom (default)
addPlugin({ name: 'json', plugin: json, location: 'top' }); // Add at the top/beginning of the array
addPlugin({ name: 'json', plugin: json, location: 'beep' }); // Add after (default) plugin 'beep'
addPlugin({ name: 'json', plugin: json, location: 'beep', how: 'before' }); // Add before plugin 'beep'
```

## Adjusting Plugin Options

Adjusting options means to either

- flatly merge objects (e.g. only the first level will be preserved)
- calling a function to do the merge yourself
- setting the raw value (if not an object or function)

```js
import { adjustPluginOptions } from 'plugins-manager';

const userSetupFunctions = [
  adjustPluginOptions('json', { preferConst: false, anotherOption: 'format' }),
];
```

Example usage:

```js
// given
addPlugin({
  name: 'json',
  plugin: json,
  options: {
    other: {
      nested: 'other.nested',
      nested2: 'other.nested2',
    },
    main: true,
  },
});

// merge objects flately
adjustPluginOptions('json', { other: { nested: '--overwritten--' } });
// resulting options = { other: { nested: '--overwritten--' }, main: true }
// NOTE: nested2 is removed

// merge via function
adjustPluginOptions('json', config => ({ other: { ...config.other, nested: '--overwritten--' } }));
// resulting options = { other: { nested: '--overwritten--', nested2: 'other.nested2' }, main: true }

// merge via function to override full options
adjustPluginOptions('json', config => ({ only: 'this' }));
// resulting options = { only: 'this' }

// setting a raw value
adjustPluginOptions('json', false);
// resulting options = false
```

## Converting metaPlugins to an actual plugin

To execute all setup function you can use this little helper

```js
const finalMetaPlugins = executeSetupFunctions(finalSetupFunctions, metaPlugins);
```

And then you can convert it into your format.
For Rollup you would execute the plugin with the options if there are any.

```js
const plugins = finalMetaPlugins.map(pluginObj => {
  if (pluginObj.options) {
    return pluginObj.plugin(pluginObj.options);
  } else {
    return pluginObj.plugin();
  }
});
```

**Examples**

Rollup has a more specific helper that handles

- `config.setupPlugins`

Note: if you provide `config.plugins` then it will return that directly ignoring `setupPlugins`

```js
import { metaConfigToRollupConfig } from 'plugins-manager';

const finalConfig = metaConfigToRollupConfig(currentConfig, defaultMetaPlugins);
```

Web Dev Server has a more specific helper that handles

- `config.setupPlugins`
- `config.setupRollupPlugins`

Note: if you provide `config.plugins` then it will return that directly ignoring `setupPlugins` and `setupRollupPlugins`

```js
import { metaConfigToWebDevServerConfig } from 'plugins-manager';
import { fromRollup } from '@web/dev-server-rollup';

const finalConfig = metaConfigToWebDevServerConfig(currentConfig, defaultMetaPlugins, {
  rollupWrapperFunction: fromRollup,
});
```

Eleventy

```js
module.exports = eleventyConfig => {
  for (const pluginObj of metaPlugins) {
    if (pluginObj.options) {
      eleventyConfig.addPlugin(pluginObj.plugin, pluginObj.options);
    } else {
      eleventyConfig.addPlugin(pluginObj.plugin);
    }
  }
};
```

Unified/Remark

```js
const parser = unified();

for (const pluginObj of metaPlugins) {
  parser.use(pluginObj.plugin, pluginObj.options);
}
```
