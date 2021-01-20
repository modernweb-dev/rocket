const path = require('path');
const fs = require('fs');
const Image = require('@11ty/eleventy-img');
const { getComputedConfig } = require('./computedConfig.cjs');
const { createSocialImageSvg: defaultcreateSocialImageSvg } = require('./createSocialImageSvg.cjs');

async function createSocialImage(args) {
  const {
    title = '',
    subTitle = '',
    footer = '',
    createSocialImageSvg = defaultcreateSocialImageSvg,
  } = args;
  const cleanedUpArgs = { ...args };
  delete cleanedUpArgs.createSocialImageSvg;

  const rocketConfig = getComputedConfig();
  const outputDir = path.join(rocketConfig.outputDevDir, '_merged_assets', '11ty-img');

  const logoPath = path.join(rocketConfig._inputDirCwdRelative, '_merged_assets', 'logo.svg');

  const logoBuffer = await fs.promises.readFile(logoPath);
  const logo = logoBuffer.toString();

  if (logo.includes('<xml')) {
    throw new Error('You should not have an "<xml" tag in your logo.svg');
  }

  const svgStr = await createSocialImageSvg({ logo, ...args });

  // TODO: cache images for 24h and not only for the given run (using @11ty/eleventy-cache-assets)
  let stats = await Image(Buffer.from(svgStr), {
    widths: [1200], // Facebook Opengraph image is 1200 x 630
    formats: ['png'],
    outputDir,
    urlPath: '/_merged_assets/11ty-img/',
    sourceUrl: `${title}${subTitle}${footer}${logo}`, // This is only used to generate the output filename hash
  });

  return stats['png'][0].url;
}

module.exports = {
  createSocialImage,
};
