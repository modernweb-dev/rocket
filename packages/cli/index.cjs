const { setComputedConfig, getComputedConfig } = require('./src/public/computedConfig.cjs');
const {
  generateEleventyComputed,
  LayoutPlugin,
  SectionPlugin,
  SocialMediaImagePlugin,
  JoiningBlocksPlugin,
} = require('./src/public/generateEleventyComputed.cjs');
const { createSocialImage } = require('./src/public/createSocialImage.cjs');

module.exports = {
  setComputedConfig,
  getComputedConfig,
  generateEleventyComputed,
  LayoutPlugin,
  SectionPlugin,
  SocialMediaImagePlugin,
  JoiningBlocksPlugin,
  createSocialImage,
};
