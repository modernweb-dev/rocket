import { resolve } from '@rocket/js/resolve.js';

export const globalData = {
  headerData: {
    logo: [
      resolve('@rocket/js/docs/assets/rocket-logo-light.svg', import.meta),
      resolve('@rocket/js/docs/assets/rocket-text-no-logo.svg', import.meta),
    ],
    homeLink: '/',
    socials: [
      {
        url: 'https://github.com/modernweb-dev/rocket',
        name: 'GitHub',
      },
      {
        url: 'https://discord.gg/sTdpM2rkKJ',
        name: 'Discord',
      },
    ],
    navLinks: [
      { text: 'Docs', href: '/setup/manual-quick-start' },
      { text: 'Examples', href: '/examples' },
    ],
  },

  footerData: [
    {
      title: 'Discover',
      links: [
        {
          text: 'Docs',
          href: '/setup/manual-quick-start',
        },
        {
          text: 'Examples',
          href: '/examples',
        },
        {
          text: 'Help and Feedback',
          href: 'https://github.com/modernweb-dev/rocket/issues',
        },
      ],
    },
    {
      title: 'Follow',
      links: [
        { text: 'GitHub', href: 'https://github.com/modernweb-dev/rocket' },
        { text: 'Twitter', href: 'https://twitter.com/modern_web_dev' },
        { text: 'Discord', href: 'https://discord.gg/sTdpM2rkKJ' },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Sponsor', href: 'https://opencollective.com/modern-web' },
        {
          text: 'Contribute',
          href: 'https://github.com/modernweb-dev/rocket/blob/main/CONTRIBUTING.md',
        },
      ],
    },
  ],
};
