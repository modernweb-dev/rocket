const htmlHeading = require('rehype-autolink-headings');
const pluginMdjs = require('../../../index.js');

function addClassAnchorToHtmlHeading(plugins) {
  return plugins.map(pluginObj => {
    if (pluginObj.plugin === htmlHeading) {
      return {
        ...pluginObj,
        options: {
          properties: {
            className: ['anchor'],
          },
        },
      };
    }
    return pluginObj;
  });
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginMdjs, {
    setupUnifiedPlugins: [addClassAnchorToHtmlHeading],
  });
  eleventyConfig.addTransform('hook-for-test');
};
