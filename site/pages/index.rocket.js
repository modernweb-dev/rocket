/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, setupUnifiedPlugins, components } from './recursive.data.js';
export { html, setupUnifiedPlugins, components };
/* END - Rocket auto generated - do not touch */

import { footerMenu } from './__shared/footerMenu.js';
import { pageTree } from './__shared/pageTree.js';
import { LayoutHome } from '@rocket/launch';

export const layout = new LayoutHome({
  pageTree,
  footerMenu,
  slogan: 'Everyone can code a website.',
  callToActionItems: [
    { text: 'Getting started', href: '/docs/setup/getting-started/' },
    { text: 'Browse Themes', href: '/presets/' },
  ],
  background: '/home-background.svg',
  reasonHeader: 'Why Rocket?',
  reasons: [
    {
      header: 'Small',
      text: 'No overblown tools or frontend frameworks, add JavaScript and/or Web Components only on pages where needed.',
    },
    {
      header: '0 JavaScript by default',
      text: 'Server side rendered Web Components means NO JavaScript by default.',
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
      text: 'While developing only pages you visit get rendered - so even with 1000 pages it will start up fast. Additionally assets are not moved but only referenced.',
    },
    {
      header: 'Fast for users',
      text: 'An optimized rollup configuration means that the page will load faster for users, even if you have a slow connection.',
    },
    {
      header: 'Batteries included',
      text: 'Comes with page navigation, 404 page, social media sharing, ...',
    },
    {
      header: 'Do less work',
      text: 'Rocket does exactly the amount of work it needs to show you the content you want. No more waiting for the server to render pages or copy assets.',
    },
  ],
});

export default () => '';
