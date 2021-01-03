const RocketNav = require('./eleventy-rocket-nav');

// export the configuration function for plugin
module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksFilter('rocketNav', RocketNav.findNavigationEntries);
  eleventyConfig.addNunjucksFilter('rocketPageAnchors', RocketNav.rocketPageAnchors);
  eleventyConfig.addNunjucksFilter('rocketNavBreadcrumb', RocketNav.findBreadcrumbEntries);
  eleventyConfig.addNunjucksFilter('rocketNavToHtml', function (pages, options) {
    return RocketNav.toHtml.call(eleventyConfig, pages, options);
  });
};

module.exports.navigation = {
  find: RocketNav.findNavigationEntries,
  findBreadcrumbs: RocketNav.findBreadcrumbEntries,
};
