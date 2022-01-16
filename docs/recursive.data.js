import { PageTree } from '@rocket/engine';
import { LayoutSidebar } from '@rocket/launch';
import { adjustPluginOptions } from 'plugins-manager';
import { mdjsSetupCode } from '@mdjs/core';

export const pageTree = new PageTree({
  inputDir: new URL('./', import.meta.url),
  outputDir: new URL('../_site', import.meta.url),
});
await pageTree.restore();

export const setupUnifiedPlugins = [
  adjustPluginOptions(mdjsSetupCode, {
    simulationSettings: {
      simulatorUrl: '/simulator/',
      themes: [
        { key: 'light', name: 'Light' },
        { key: 'dark', name: 'Dark' },
      ],
      platforms: [
        { key: 'web', name: 'Web' },
        { key: 'android', name: 'Android' },
        { key: 'ios', name: 'iOS' },
      ],
    },
  }),
];

export const footerMenu = [
  {
    name: 'Discover',
    children: [
      {
        text: 'Blog',
        href: '/blog/',
      },
      {
        text: 'Help and Feedback',
        href: 'https://github.com/modernweb-dev/rocket/issues',
      },
    ],
  },
  {
    name: 'Follow',
    children: [
      {
        text: 'GitHub',
        href: 'https://github.com/modernweb-dev/rocket',
      },
      {
        text: 'Twitter',
        href: 'https://twitter.com/modern_web_dev',
      },
      {
        text: 'Slack',
        href: '/about/slack/',
      },
    ],
  },
  {
    name: 'Support',
    children: [
      {
        text: 'Sponsor',
        href: '/about/sponsor/',
      },
      {
        text: 'Contribute',
        href: 'https://github.com/modernweb-dev/rocket/blob/main/CONTRIBUTING.md',
      },
    ],
  },
];

export const layout = new LayoutSidebar({ pageTree, footerMenu });

// export const openGraphLayout = new OpenGraphLayoutLogo();
