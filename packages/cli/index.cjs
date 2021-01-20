const { setComputedConfig, getComputedConfig } = require('./src/public/computedConfig.cjs');
const { generateEleventyComputed } = require('./src/public/generateEleventyComputed.cjs');
const { createSocialImage } = require('./src/public/createSocialImage.cjs');

module.exports = {
  setComputedConfig,
  getComputedConfig,
  generateEleventyComputed,
  createSocialImage,
};
