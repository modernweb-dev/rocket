const path = require('path');
const fs = require('fs');
const Image = require('@11ty/eleventy-img');
const { getComputedConfig } = require('./computedConfig.cjs');

async function createPageSocialImage({ title = '', subTitle = '', subTitle2 = '', footer = '' }) {
  const rocketConfig = getComputedConfig();
  const outputDir = path.join(rocketConfig.outputDevDir, '_merged_assets', '11ty-img');

  const logoPath = path.join(rocketConfig._inputDirCwdRelative, '_merged_assets', 'logo.svg');

  const logoBuffer = await fs.promises.readFile(logoPath);
  const logo = logoBuffer.toString();

  let svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="#4a4a4a" font-family="sans-serif" font-size="80" style="background-color:#fff" viewBox="0 0 1200 630">
      <defs></defs>
      <rect width="100%" height="100%" fill="#fff" />
      <circle cx="1000" cy="230" r="530" fill="#ebebeb"></circle>
  `;

  if (logo) {
    svgStr += `<g transform="matrix(0.7, 0, 0, 0.7, 500, 100)">${logo}</g>`;
  }

  if (title) {
    svgStr += `
      <text x="70" y="200" font-family="'Bitstream Vera Sans','Helvetica',sans-serif" font-weight="700">
        ${title}
      </text>
    `;
  }

  if (subTitle) {
    svgStr += `
      <text x="70" y="320" font-family="'Bitstream Vera Sans','Helvetica',sans-serif" font-weight="700" font-size="60">
        ${subTitle}
      </text>
    `;
  }

  if (subTitle2) {
    svgStr += `
      <text x="70" y="420" font-family="'Bitstream Vera Sans','Helvetica',sans-serif" font-weight="700" font-size="60">
        ${subTitle2}
      </text>
    `;
  }

  if (footer) {
    svgStr += `
      <text x="70" y="560" fill="gray" font-size="40">
        ${footer}
      </text>
    `;
  }

  svgStr += '</svg>';

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
  createPageSocialImage,
};
