/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, setupUnifiedPlugins, components } from './recursive.data.js';
export { html, setupUnifiedPlugins, components };
export async function registerCustomElements() {
  // server-only open-graph only components
  // prettier-ignore
  customElements.define('card-icon', await import('@rocket/components/components/CardIcon').then(m => m.CardIcon));
  // client-only components
  // 'rocket-search': () => import('@rocket/search/web').then(m => m.RocketSearch),
}
/* END - Rocket auto generated - do not touch */

import { footerMenu } from './__shared/footerMenu.js';
import { pageTree } from './__shared/pageTree.js';
import { LayoutHome } from '@rocket/launch';
import { search } from './__shared/search.js';

export const description =
  'Rocket enables everyone to code a website. Use an existing theme or create your own. Be fast by server rendering web components with little to no JavaScript.';
export const subTitle = 'Everyone can code a website';

export const layout = new LayoutHome({
  pageTree,
  footerMenu,
  header__40: search,
  titleWrapperFn: () => 'Welcome to Rocket',
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

export const openGraphLayout = data => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <link
        rel="preload"
        href="/fonts/OpenSans-VariableFont_wdth,wght.woff2"
        as="font"
        type="font/woff2"
        crossorigin
      />
      <style type="text/css">
        @font-face {
          font-family: 'Open Sans';
          src: url('/fonts/OpenSans-VariableFont_wdth,wght.woff2')
              format('woff2 supports variations'),
            url('/fonts/OpenSans-VariableFont_wdth,wght.woff2') format('woff2-variations');
          font-weight: 1 999;
          font-display: optional;
        }
        body {
          font-family: 'Open Sans', sans-serif;
          background: conic-gradient(from 90deg at 50% 0%, #111, 50%, #222, #111);
          color: #ccc;
          font-size: 30px;
          display: block;
          height: 100vh;
          padding: 30px;
          box-sizing: border-box;
          margin: 0;
        }
        #logo {
          width: 35%;
          margin-top: 3%;
          margin-left: 3%;
        }
        p {
          margin-left: 3%;
        }
        #sub-title {
          font-size: 44px;
        }
        #bg-wrapper {
          position: absolute;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          left: 0;
          top: 0;
        }
        #bg-wrapper img {
          position: absolute;
          right: -15%;
          top: -6%;
          transform: rotate(45deg);
          width: 61%;
          z-index: 10;
        }
        .item {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .item card-icon {
          width: 50px;
          height: 50px;
        }
      </style>
    </head>
    <body>
      <img id="logo" src="resolve:#assets/logo-dark-with-text.svg" />
      <div id="bg-wrapper">
        <img src="resolve:#assets/home-background.svg" />
      </div>
      <p id="sub-title">${data.subTitle || ''}</p>

      <p class="item">
        <card-icon icon="solid/server" variation="green"></card-icon>
        <span>Server renders your web components</span>
      </p>

      <p class="item">
        <card-icon icon="solid/stopwatch" variation="blue"></card-icon>
        <span>FAST because of zero or little JavaScript</span>
      </p>

      <p class="item">
        <card-icon icon="solid/battery-full"></card-icon>
        <span>Batteries included with routing/themes/menus/...</span>
      </p>
    </body>
  </html>
`;
