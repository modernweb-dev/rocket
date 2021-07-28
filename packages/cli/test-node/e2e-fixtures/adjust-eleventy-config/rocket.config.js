/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  eleventy: (config, rocketConfig) => {
    config.addFilter('conditional-resolve', value => {
      if (rocketConfig.command === 'build') {
        return `build:${value}`;
      }
      if (rocketConfig.command === 'start') {
        return `start:${value}`;
      }
    });
  },
};

export default config;
