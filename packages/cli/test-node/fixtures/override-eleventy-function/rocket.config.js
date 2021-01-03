export default {
  eleventy: eleventyConfig => {
    eleventyConfig.setQuietMode(true);

    return {
      dir: {
        data: '--config-function-override--',
      },
    };
  },
};
