/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  imagePresets: {
    responsive: {
      ignore: ({ src }) =>
        src.endsWith('.jpeg') || src.endsWith('svg') || src.includes('rocket-unresponsive.'),
    },
  },
};
export default config;
