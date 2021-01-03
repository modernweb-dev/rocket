const pluginMdjs = require('../../../index.js');

function addClassAnchorToHtmlHeading(plugins) {
  return plugins.map(pluginObj => {
    if (pluginObj.name === 'htmlHeading') {
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
