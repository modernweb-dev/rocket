export default {
  devServer: {
    more: 'from-file',
  },
  eleventy: {
    dir: {
      data: '--config-override--',
    },
  },
  imagePresets: {
    responsive: {
      sizes: '--override-sizes--',
    },
  },
};
