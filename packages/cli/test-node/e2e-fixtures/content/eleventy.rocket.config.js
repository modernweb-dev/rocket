/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  eleventy: eleventyConfig => {
    eleventyConfig.addTransform('addFoo', content => `# BEFORE #\n${content}`);
  },
};

export default config;
