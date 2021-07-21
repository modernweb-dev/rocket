// @ts-no-check

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  rollup: config => ({
    ...config,
    shimMissingExports: true,
  }),
};

export default config;
