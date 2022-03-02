import { LayoutSidebar } from '@rocket/launch';
import { adjustPluginOptions } from 'plugins-manager';
import { mdjsSetupCode } from '@mdjs/core';
import { footerMenu } from './__shared/footerMenu.js';
import { pageTree } from './__shared/pageTree.js';
export { html } from 'lit';

export const layout = new LayoutSidebar({ pageTree, footerMenu });

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

// export const openGraphLayout = new OpenGraphLayoutLogo();
