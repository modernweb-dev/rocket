# Eleventy Plugins >> Markdown JavaScript (Mdjs)

Use mdjs in your Eleventy site.

## Setup

```
npm install @rocket/eleventy-plugin-mdjs
```

Create an Eleventy config file `.eleventy.js`

```js
const pluginMdjs = require('@rocket/eleventy-plugin-mdjs');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginMdjs);
};
```

## Configure a unified or remark plugin with mdjs

By providing a `setupUnifiedPlugins` function as an option to `eleventy-plugin-mdjs` you can set options for all unified/remark plugins.

We do use [plugins-manager](../tools/plugins-manager.md).

This example adds a CSS class to the `htmlHeading` plugin so heading links can be selected in CSS.

```js
const pluginMdjs = require('@rocket/eleventy-plugin-mdjs');
const { adjustPluginOptions } = require('plugins-manager');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginMdjs, {
    setupUnifiedPlugins: [
      adjustPluginOptions('htmlHeading', {
        properties: {
          className: ['anchor'],
        },
      }),
    ],
  });
};
```

## Add a unified or remark plugin

The order of plugins is important in unified as each plugin processes the content and passes on its result.
Some plugins do work with the markdown AST and some with the rehype (e.g. html) AST. In order to get access to the correct AST the plugin needs to be in a specific location in the processing order.

Examples on how to insert a plugin right after creating the markdown AST.

```js
const pluginMdjs = require('@rocket/eleventy-plugin-mdjs');
const { addPlugin } = require('plugins-manager');
const { myRemarkPlugin } = require('./my-remark-plugin.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginMdjs, {
    setupUnifiedPlugins: [
      addPlugin({ name: 'my-remark-plugin', plugin: myRemarkPlugin, location: 'markdown' }),
    ],
  });
};
```

Examples on how to insert a plugin right after creating the rehype AST.

```js
const pluginMdjs = require('@rocket/eleventy-plugin-mdjs');
const { addPlugin } = require('plugins-manager');
const { myRehypePlugin } = require('./my-rehype-plugin.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginMdjs, {
    setupUnifiedPlugins: [
      addPlugin({ name: 'my-rehype-plugin', plugin: myRehypePlugin, location: 'remark2rehype' }),
    ],
  });
};
```

You can also add both

```js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginMdjs, {
    setupUnifiedPlugins: [
      addPlugin({ name: 'my-remark-plugin', plugin: myRemarkPlugin, location: 'markdown' }),
      addPlugin({ name: 'my-rehype-plugin', plugin: myRehypePlugin, location: 'remark2rehype' }),
    ],
  });
};
```
