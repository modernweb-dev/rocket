import { netlify } from '@rocket/js/adapters/netlify.js';

/** @type {import("@rocket/js/types.js").RocketConfig} */
export default {
  includeGlobs: ['docs/**/*.rocket.{md,js}'],
  adapter: netlify(),
  siteOrigin: 'https://rocket.modern-web.dev',
  siteHeadMetadata: {
    siteName: 'Rocket',
    defaultDescription:
      'Rocket is a static-site framework for configured Pages, built for deployable websites that start with HTML and add JavaScript only where needed.',
    language: 'en',
    icons: {
      svg: '/favicon.svg',
    },
    themeColor: '#d01a1c',
    socialPreview: {
      delivery: 'static',
    },
  },
  siteDiscoverability: {
    sitemap: true,
    robots: true,
  },
};
