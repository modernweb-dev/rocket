# Tools >> Plugins Manager ||10

The Plugins Manager replaces the specific registration/execution (with options) in a given plugin system by an intend to use a plugin (with these options).
This allows your users to adjust the options before actually applying the plugins.

## Setup

1. Install npm package
   ```bash
   npm i plugins-manager
   ```
2. Change your public API from an array of plugin "instances" to an array of setup functions
   ```diff
     import myPlugin from 'my-plugin';
   + import { addPlugin } from 'plugins-manager';
     export default {
   -   plugins: [myPlugin],
   +   setupPlugins: [addPlugin(myPlugin)]
     }
   ```
3. Convert setup function to plugins

   ```js
   import { applyPlugins } from 'plugins-manager';

   const finalConfig = applyPlugins(config); // "converts" setupPlugins to plugins

   // work with plugins or pass it on to another tool
   const bundle = await rollup(finalConfig);
   ```

## Usage

As you users in most cases you will need to either add or adjust a given plugin in a config file.

👉 `my-tool.config.js`

```js
import { addPlugin, adjustPluginOptions } from 'plugins-manager';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  setupPlugins: [
    // add a new plugin with optional plugin options
    addPlugin(json, {
      /* ... */
    }),

    // adjust the options of a plugin that is already registered
    adjustPluginOptions(nodeResolve, {
      /* ... */
    }),
  ],
};
```

## Plugins can be functions or classes

### Function Plugins

```js
function myPlugin({ lastName: 'initial-second' }) {
  // ...
}

export default {
  setupPlugins: [addPlugin(myPlugin)],
};

// function parameters are type safe
addPlugin(myPlugin, { lastName: 'new name' }); // ts ok
addPlugin(myPlugin, { otherProp: 'new name' }); // ts error
```

### Class Plugins

The options are passed to the constructor.

```js
/**
 * @typedef {object} MyClassOptions
 * @property {string} lastName
 */

class MyClass {
  /** @type {MyClassOptions} */
  options = {
    lastName: 'initial-second',
  };

  /**
   * @param {Partial<MyClassOptions>} options
   */
  constructor(options = {}) {
    this.options = { ...this.options, ...options };
  }

  // ...
}

export default {
  setupPlugins: [addPlugin(MyClass)],
};

// constructor parameters are type safe
addPlugin(MyClass, { lastName: 'new name' }); // ts ok
addPlugin(MyClass, { otherProp: 'new name' }); // ts error
```

## Problem

Many plugin systems require you to either execute a plugin function like in `rollup`.

```js
import json from '@rollup/plugin-json';

export default /** @type {import('rocket/cli').RocketCliConfig} */ ({
  plugins: [json({ preferConst: true })],
});
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

## Problem Statement

> Executing or adding a plugin in a special way is a one time process. You can not transparently later change the options of the given plugin.

This means if you wish to define default plugins and allow your user to override all of the settings it's "impossible".

## Solution

The plugins manager lets you orchestrate a set of "meta plugins" which are defined by

- plugin (class or function)
- it's options

```js
import beep from '@rollup/plugin-beep';
import url from '@rollup/plugin-url';

let metaPlugins = [{ plugin: beep }, { plugin: url, options: { limit: 10000 } }];
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

Doing array manipulations is kinda error-prone so we encourage to use an array of setup function. Where as each setup function can either add a new plugin (with a unique name) or adjust an already existing plugin.

```js
import { addPlugin, adjustPluginOptions } from 'plugins-manager';

const systemSetupFunctions = [addPlugin(first), addPlugin(second)];
const userSetupFunctions = [adjustPluginOptions(first, { my: 'options' })];
```

Arrays of functions can by merged like so

```js
const finalSetupFunctions = [...systemSetupFunctions, ...userSetupFunctions];
```

and then converted to the final output.

```js
import { applyPlugins } from 'plugins-manager';

const plugins = applyPlugins(finalSetupFunctions, metaPlugins);
```

## Adding a Plugin

This makes sure that

- the name is unique
- you can add at at `top`, `bottom` and `after/before` a given other plugin

By default it adds at the bottom.

```js
import json from '@rollup/plugin-json';
import { addPlugin } from 'plugins-manager';

const userSetupFunctions = [addPlugin(json, { preferConst: true })];
```

Example usage:

```js
addPlugin(json); // Add at the bottom (default)
addPlugin(json, {}, { location: 'top' }); // Add at the top/beginning of the array
addPlugin(json, {}, { location: beep }); // Add after (default) plugin 'beep'
addPlugin(json, {}, { location: beep, how: 'before' }); // Add before plugin 'beep'
```

This is type safe and typescript will throw an error if you pass the wrong type.

```js
function myPlugin({ myFlag = false } = {}) {
  // ...
}

addPlugin(myPlugin, { myFlag: true }); // ts ok
addPlugin(myPlugin, { notExisting: true }); // ts error
```

Note: There is a "hidden" feature in addPlugin that if you attach a `wrapPlugin` property to the returning function it will call `wrapPlugin` on the plugin before adding it.

```js
// example auto wrap rollup plugins for @web/dev-server
import { fromRollup } from '@web/dev-server-rollup';

const userSetupFunctions = [addPlugin(json)].map(mod => {
  mod.wrapPlugin = fromRollup;
  return mod;
});
```

## Adjusting Plugin Options

Adjusting options means to either

- flatly merge objects (e.g. only the first level will be preserved)
- calling a function to do the merge yourself
- setting the raw value (if not an object or function)
- you need to have a reference to the plugin (which is used to auto complete the available options via typescript)

```js
import json from '@rollup/plugin-json';
import { adjustPluginOptions } from 'plugins-manager';

const userSetupFunctions = [
  adjustPluginOptions(json, { preferConst: false, anotherOption: 'format' }),
];
```

Example usage:

```js
// given
addPlugin(json, {
  other: {
    nested: 'other.nested',
    nested2: 'other.nested2',
  },
  main: true,
});

// merge objects flately
adjustPluginOptions(json, { other: { nested: '--overwritten--' } });
// resulting options = { other: { nested: '--overwritten--' }, main: true }
// NOTE: nested2 is removed

// merge via function
adjustPluginOptions(json, config => ({ other: { ...config.other, nested: '--overwritten--' } }));
// resulting options = { other: { nested: '--overwritten--', nested2: 'other.nested2' }, main: true }

// merge via function to override full options
adjustPluginOptions(json, config => ({ only: 'this' }));
// resulting options = { only: 'this' }

// setting a raw value
adjustPluginOptions(json, false);
// resulting options = false
```

This is type safe and typescript will throw an error if you pass the wrong type.

```js
function myPlugin({ myFlag = false } = {}) {
  // ...
}

adjustPluginOptions(myPlugin, { myFlag: true }); // ts ok
adjustPluginOptions(myPlugin, { notExisting: true }); // ts error
```

## Remove Plugin

Sometimes you would like to remove a default plugin from the config.

```js
export default {
  setupPlugins: [removePlugin(json)],
};
```

## Converting metaPlugins to an Actual Plugin

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
import { applyPlugins } from 'plugins-manager';

const finalConfig = applyPlugins(currentConfig, defaultMetaPlugins);
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
