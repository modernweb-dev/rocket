import { adjustPluginOptions } from 'plugins-manager';

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  start: {
    createSocialMediaImages: true,
  },
  setupEleventyComputedConfig: [
    adjustPluginOptions('socialMediaImage', {
      createSocialImageSvg: async () => {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
            <defs></defs>
            <rect width="100%" height="100%" fill="#fff" />
            <text x="70" y="200" font-family="'Bitstream Vera Sans','Helvetica',sans-serif" font-weight="700" font-size="80">
              Hard Coded Title
            </text>
          </svg>
        `;
      },
    }),
  ],
};

export default config;
