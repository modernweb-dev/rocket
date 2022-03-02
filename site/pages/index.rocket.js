/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, setupUnifiedPlugins } from './recursive.data.js';
export { html, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */

import { footerMenu } from './__shared/footerMenu.js';
import { pageTree } from './__shared/pageTree.js';
import { LayoutHome } from '@rocket/launch';

export const layout = new LayoutHome({
  pageTree,
  footerMenu,
  slogan: 'The modern web setup for static sites with a sprinkle of JavaScript.',
  callToActionItems: [
    { text: 'Follow Guides', href: '/guides/' },
    { text: 'Browse Docs', href: '/docs/' },
  ],
  background: '/home-background.svg',
  reasonHeader: 'Why Rocket?',
  reasons: [
    {
      header: 'Small',
      text:
        'No overblown tools or frontend frameworks, add JavaScript and/or Web Components only on pages where needed.',
    },
    {
      header: 'Pre-Rendered',
      text: 'Statically generated content means less JavaScript to ship and process.',
    },
    {
      header: 'Zero Configuration',
      text: 'Automatic code splitting, filesystem based routing, and JavaScript in Markdown.',
    },
    {
      header: 'Meta Framework',
      text: html`Build on top of giants like <a href="https://www.modern-web.dev/">Modern Web</a>,
        <a href="https://lit.dev/">Lit</a>, and
        <a href="https://rollupjs.org/">Rollup</a>
        .`,
    },
    {
      header: 'Theme Support',
      text: 'You have the content - we have the themes - or you build your own',
    },
    {
      header: 'Always fast while developing',
      text:
        'While developing it only renders pages you visit - so even with 1000 pages it will start up fast',
    },
    {
      header: 'Fast for users',
      text:
        'An optimized rollup configuration means that the page will load faster for users, even if you have a slow connection.',
    },
  ],
});

export default () => '';
