/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  eleventy: () => {
    return {
      pathPrefix: 'fake',
    };
  },
};

export default config;
