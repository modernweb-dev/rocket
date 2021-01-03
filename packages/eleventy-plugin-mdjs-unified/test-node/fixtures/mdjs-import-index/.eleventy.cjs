const pluginMdjs = require('../../../index.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginMdjs);
  eleventyConfig.addTransform('hook-for-test');
};
