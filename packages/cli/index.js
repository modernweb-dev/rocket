/** @typedef {import('@rocket/cli/types/main').RocketCliOptions} RocketCliOptions */

export { setComputedConfig, getComputedConfig } from './src/public/computedConfig.cjs';
export {
  generateEleventyComputed,
  LayoutPlugin,
  SectionPlugin,
  SocialMediaImagePlugin,
  JoiningBlocksPlugin,
} from './src/public/generateEleventyComputed.cjs';
export { createSocialImage } from './src/public/createSocialImage.cjs';

export { RocketCli } from './src/RocketCli.js';
