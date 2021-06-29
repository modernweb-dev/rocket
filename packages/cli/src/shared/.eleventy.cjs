const eleventyPluginMdjsUnified = require('@rocket/eleventy-plugin-mdjs-unified');
const eleventyRocketNav = require('@rocket/eleventy-rocket-nav');

const { getComputedConfig } = require('../public/computedConfig.cjs');
const rocketFilters = require('../eleventy-plugins/rocketFilters.cjs');
const rocketCopy = require('../eleventy-plugins/rocketCopy.cjs');
const rocketCollections = require('../eleventy-plugins/rocketCollections.cjs');
const { adjustPluginOptions } = require('plugins-manager');
const image = require('./mdjsImageHandler.cjs');

const defaultSetupUnifiedPlugins = [
  adjustPluginOptions('remark2rehype', {
    handlers: {
      image,
    },
  }),
];

module.exports = function (eleventyConfig) {
  const config = getComputedConfig();

  const { pathPrefix, _inputDirCwdRelative, outputDevDir } = config;

  let metaPlugins = [
    {
      name: 'rocket-filters',
      plugin: rocketFilters,
      options: { _inputDirCwdRelative },
    },
    {
      name: 'rocket-copy',
      plugin: rocketCopy,
      options: { _inputDirCwdRelative },
    },
    {
      name: 'eleventy-plugin-mdjs-unified',
      plugin: eleventyPluginMdjsUnified,
      options: {
        setupUnifiedPlugins: [...defaultSetupUnifiedPlugins, ...config.setupUnifiedPlugins],
      },
    },
    {
      name: 'eleventy-rocket-nav',
      plugin: eleventyRocketNav,
    },
    {
      name: 'rocket-collections',
      plugin: rocketCollections,
      options: { _inputDirCwdRelative },
    },
  ];

  if (Array.isArray(config.setupEleventyPlugins)) {
    for (const setupFn of config.setupEleventyPlugins) {
      metaPlugins = setupFn(metaPlugins);
    }
  }

  try {
    for (const pluginObj of metaPlugins) {
      if (pluginObj.options) {
        eleventyConfig.addPlugin(pluginObj.plugin, pluginObj.options);
      } else {
        eleventyConfig.addPlugin(pluginObj.plugin);
      }
    }
  } catch (err) {
    console.log('An eleventy plugin had an error', err);
  }

  if (config.eleventy) {
    const returnValue = config.eleventy(eleventyConfig);
    if (returnValue) {
      const returnString = JSON.stringify(returnValue, null, 2);
      const msg = [
        'Error: Setting eleventy values from within a rocket.config.mjs file is not allowed.',
        'All settings should be available at the root of the config.',
        'If something is missing then please open an issue. You are trying to set:',
        returnString,
      ].join('\n');
      console.error(msg);
      throw new Error(msg);
    }
  }

  return {
    dir: {
      // no input: inputDir as we set this when we create the eleventy instance
      data: '_merged_data',
      includes: '_merged_includes',
      output: outputDevDir,
    },
    pathPrefix,
    passthroughFileCopy: true,
  };
};
