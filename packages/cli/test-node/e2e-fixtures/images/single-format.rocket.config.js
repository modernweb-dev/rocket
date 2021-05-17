/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  imagePresets: {
    responsive: {
      widths: [30, 60],
      formats: ['jpeg'],
      sizes: '(min-width: 1024px) 30px, 60px',
    },
  },
};
export default config;
