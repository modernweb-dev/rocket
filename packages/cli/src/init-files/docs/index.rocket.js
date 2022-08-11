/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { pageTree } from './recursive.data.js';
export { pageTree };
/* END - Rocket auto generated - do not touch */

import { html } from 'lit';

import { LayoutHome } from '@rocket/launch';
import { footerMenu } from './__shared/footerMenu.js';

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
      text: 'No overblown tools or frontend frameworks, add JavaScript and/or Web Components only on pages where needed.',
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
      text: html`Build on top of giants like <a href="https://www.11ty.dev/">Eleventy</a>,
        <a href="https://rollupjs.org/">Rollup</a>, and
        <a href="https://www.modern-web.dev/">Modern Web</a>.`,
    },
    {
      header: 'Powerful Default Template',
      text: 'Provide content and you are ready to go.',
    },
    {
      header: 'Ready for Production',
      text: 'Optimized for a smaller build size, faster dev compilation and dozens of other improvements.',
    },
  ],
});

export default () => '';
