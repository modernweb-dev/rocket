/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, setupUnifiedPlugins, components } from './recursive.data.js';
export { html, setupUnifiedPlugins, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('launch-home', await import('@rocket/launch/home.js').then(m => m.LaunchHome));
  // prettier-ignore
  customElements.define('rocket-content-area', await import('@rocket/components/content-area.js').then(m => m.RocketContentArea));
  // server-only open-graph only components
  // prettier-ignore
  customElements.define('rocket-icon-card', await import('@rocket/components/icon-card.js').then(m => m.RocketIconCard));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
export const needsLoader = true;
/* END - Rocket auto generated - do not touch */

import { LayoutHome } from '@rocket/launch';
import { layoutData } from '#src/layouts/layoutData.js';

export const description =
  'Rocket enables everyone to code a website. Use an existing theme or create your own. Be fast by server rendering web components with little to no JavaScript.';
export const subTitle = 'Everyone can code a website';

export const layout = new LayoutHome({
  ...layoutData,
  titleWrapperFn: () => 'Welcome to Rocket',
  background: '/home-background.svg',
});

const reasons = [
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
];

export default () => html`
  <rocket-content-area>
    <launch-home .reasons=${reasons} background-image>
      <h1 slot="title">
        <picture>
          <!-- <source srcset="../src/assets/rocket-logo-dark-with-text-below.svg" media="(prefers-color-scheme: dark)"> -->
          <!-- <source srcset="../src/assets/rocket-logo-dark-with-text.svg" media="(prefers-color-scheme: dark) and (min-width: 1024px)"> -->
          <source
            srcset="../src/assets/rocket-logo-light-with-text.svg"
            media="(min-width: 1024px)"
            width="250"
            height="67.87"
          />
          <img
            src="../src/assets/rocket-logo-light-with-text-below.svg"
            alt="Rocket"
            width="250"
            height="257.92"
          />
        </picture>
      </h1>
      <p slot="slogan">Everyone can code a website.</p>
      <a slot="cta" role="listitem" href="/docs/setup/getting-started/">Getting Started</a>
      <a slot="cta" role="listitem" href="/presets/">Browse Themes</a>
      <h2 slot="reason-header">Why Rocket?</h2>

      <img src="../src/assets/home-background.svg" slot="background" role="presentation" />

      <style type="text/css">
        /* workaround until Firefox supports width/height on source tags https://bugzilla.mozilla.org/show_bug.cgi?id=1694741 */
        @media (min-width: 1024px) {
          h1 img {
            height: 67.87px;
          }
        }
      </style>
    </launch-home>
  </rocket-content-area>
`;

export const openGraphLayout = data => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <link
        rel="preload"
        href="/fonts/Rubik-VariableFont_wght.woff2"
        as="font"
        type="font/woff2"
        crossorigin
      />
      <style type="text/css">
        @font-face {
          font-family: 'Rubik';
          src: url('/fonts/Rubik-VariableFont_wght.woff2') format('woff2 supports variations'),
            url('/fonts/Rubik-VariableFont_wght.woff2') format('woff2-variations');
          font-weight: 1 999;
          font-display: optional;
        }
        body {
          font-family: 'Rubik', sans-serif;
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
        .item rocket-icon-card {
          width: 50px;
          height: 50px;
        }
      </style>
    </head>
    <body>
      <img id="logo" src="resolve:#src/assets/rocket-logo-dark-with-text.svg" />
      <div id="bg-wrapper">
        <img src="resolve:#src/assets/home-background.svg" />
      </div>
      <p id="sub-title">${data.subTitle || ''}</p>

      <p class="item">
        <rocket-icon-card icon="solid/server" variation="green"></rocket-icon-card>
        <span>Server renders your web components</span>
      </p>

      <p class="item">
        <rocket-icon-card icon="solid/stopwatch" variation="blue"></rocket-icon-card>
        <span>FAST because of zero or little JavaScript</span>
      </p>

      <p class="item">
        <rocket-icon-card icon="solid/battery-full"></rocket-icon-card>
        <span>Batteries included with routing/themes/menus/...</span>
      </p>
    </body>
  </html>
`;
